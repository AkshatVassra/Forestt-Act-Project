#!/usr/bin/env python3
"""
Forest Rights Authority OCR and NER Backend Service
Processes documents with Tesseract OCR and spaCy NER
"""

import os
import sys
import json
import time
import logging
from typing import Dict, List, Any
from datetime import datetime
import requests
from io import BytesIO

try:
    import pytesseract
    from PIL import Image
    import spacy
    import numpy as np
    from flask import Flask, request, jsonify
    from supabase import create_client, Client
except ImportError as e:
    print(f"[v0] Missing dependency: {e}")
    print("[v0] Please install: pip install pytesseract pillow spacy flask supabase-py requests")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize Supabase client
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("[v0] Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load spaCy model
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    logger.info("[v0] Downloading spaCy model...")
    os.system('python -m spacy download en_core_web_sm')
    nlp = spacy.load('en_core_web_sm')


class OCRProcessor:
    """Handles OCR processing with Tesseract"""
    
    @staticmethod
    def extract_text_from_image(image_path: str, language: str = 'eng') -> Dict[str, Any]:
        """Extract text from image using Tesseract OCR"""
        try:
            logger.info(f"[v0] Processing image: {image_path}")
            
            # Download image if it's a URL
            if image_path.startswith('http'):
                response = requests.get(image_path)
                image = Image.open(BytesIO(response.content))
            else:
                image = Image.open(image_path)
            
            # Preprocess image
            image = OCRProcessor._preprocess_image(image)
            
            # Extract text
            start_time = time.time()
            text = pytesseract.image_to_string(image, lang=language)
            processing_time = int((time.time() - start_time) * 1000)
            
            # Get confidence score
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confidences = [int(c) for c in data['confidence'] if int(c) > 0]
            confidence = np.mean(confidences) if confidences else 0
            
            logger.info(f"[v0] OCR completed in {processing_time}ms with {confidence:.2f}% confidence")
            
            return {
                'raw_text': text,
                'confidence': float(confidence),
                'processing_time_ms': processing_time,
                'page_count': 1,
            }
        except Exception as e:
            logger.error(f"[v0] OCR processing error: {str(e)}")
            raise
    
    @staticmethod
    def _preprocess_image(image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too small
        if image.width < 300:
            ratio = 300 / image.width
            new_size = (int(image.width * ratio), int(image.height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        return image


class NERExtractor:
    """Handles Named Entity Recognition with spaCy"""
    
    @staticmethod
    def extract_entities(text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        try:
            logger.info("[v0] Starting NER extraction")
            
            doc = nlp(text)
            entities = []
            
            for ent in doc.ents:
                entities.append({
                    'entity_type': ent.label_,
                    'entity_text': ent.text,
                    'confidence': 0.95,  # spaCy doesn't provide confidence, using default
                    'start_position': ent.start_char,
                    'end_position': ent.end_char,
                })
            
            logger.info(f"[v0] Extracted {len(entities)} entities")
            return entities
        except Exception as e:
            logger.error(f"[v0] NER extraction error: {str(e)}")
            raise


class DocumentProcessor:
    """Main document processor orchestrating OCR and NER"""
    
    @staticmethod
    async def process_document(document_id: str) -> bool:
        """Process a document: OCR -> NER -> Store results"""
        try:
            logger.info(f"[v0] Starting document processing: {document_id}")
            
            # Fetch document from Supabase
            response = supabase.table('documents').select('*').eq('id', document_id).single().execute()
            document = response.data
            
            if not document:
                logger.error(f"[v0] Document not found: {document_id}")
                return False
            
            # Step 1: OCR Processing
            logger.info("[v0] Step 1: OCR processing")
            ocr_data = OCRProcessor.extract_text_from_image(document['file_path'])
            
            # Save OCR results
            ocr_response = supabase.table('ocr_results').insert({
                'document_id': document_id,
                'raw_text': ocr_data['raw_text'],
                'confidence': ocr_data['confidence'],
                'page_count': ocr_data['page_count'],
                'processing_time_ms': ocr_data['processing_time_ms'],
            }).execute()
            
            ocr_result_id = ocr_response.data[0]['id']
            logger.info(f"[v0] OCR results saved: {ocr_result_id}")
            
            # Step 2: NER Extraction
            logger.info("[v0] Step 2: NER extraction")
            entities = NERExtractor.extract_entities(ocr_data['raw_text'])
            
            # Save extracted entities
            if entities:
                supabase.table('extracted_entities').insert(
                    [
                        {
                            'ocr_result_id': ocr_result_id,
                            **entity
                        }
                        for entity in entities
                    ]
                ).execute()
            
            logger.info(f"[v0] Entities saved: {len(entities)} entities")
            
            # Update document status to completed
            supabase.table('documents').update({
                'status': 'completed',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', document_id).execute()
            
            logger.info(f"[v0] Document processing completed: {document_id}")
            return True
            
        except Exception as e:
            logger.error(f"[v0] Document processing error: {str(e)}")
            
            # Update document status to failed
            supabase.table('documents').update({
                'status': 'failed',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', document_id).execute()
            
            return False


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'FRA OCR Backend'})


@app.route('/process', methods=['POST'])
def process():
    """Process a document for OCR and NER"""
    try:
        data = request.get_json()
        document_id = data.get('documentId')
        
        if not document_id:
            return jsonify({'error': 'documentId is required'}), 400
        
        # Process document (async would be better in production)
        import asyncio
        success = asyncio.run(DocumentProcessor.process_document(document_id))
        
        if success:
            return jsonify({'status': 'processing', 'documentId': document_id})
        else:
            return jsonify({'error': 'Processing failed'}), 500
            
    except Exception as e:
        logger.error(f"[v0] Endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/status/<document_id>', methods=['GET'])
def status(document_id: str):
    """Get processing status of a document"""
    try:
        response = supabase.table('documents').select('status, updated_at').eq('id', document_id).single().execute()
        document = response.data
        
        return jsonify({
            'documentId': document_id,
            'status': document['status'],
            'updatedAt': document['updated_at']
        })
    except Exception as e:
        logger.error(f"[v0] Status endpoint error: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    logger.info(f"[v0] Starting FRA OCR Backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
