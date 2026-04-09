# FRA Backend System Setup Guide

## Overview

This document provides setup instructions for the complete Forest Rights Authority (FRA) backend system with OCR and NER capabilities.

## Architecture

```
Frontend (React/Vite)
    ↓
Vercel Blob (File Storage)
    ↓
Supabase PostgreSQL (Database)
    ↓
Python Backend Service (OCR/NER Processing)
```

## Components

### 1. Database Schema (Supabase PostgreSQL)

**Tables:**
- `documents` - Stores uploaded file metadata
- `ocr_results` - Stores OCR text extraction results
- `extracted_entities` - Stores NER extracted named entities
- `claims` - Stores finalized claim records

**Setup:**
```bash
# Connect to your Supabase database and run:
psql -h [your-host] -U [your-user] -d [your-database] < scripts/01_create_schema.sql
```

### 2. Frontend Integration

**API Endpoints Used:**
- `POST /api/upload` - Upload document and store metadata
- `POST /api/process` - Trigger backend processing
- `GET /api/status/:documentId` - Check processing status
- `GET /api/ocr/:documentId` - Get OCR results
- `GET /api/entities/:ocrResultId` - Get extracted entities

**Components:**
- `UploadInterface.tsx` - Document upload and batch processing
- `ExtractedDataViewer.tsx` - Display OCR results and entities
- `useDocumentProcessor.ts` - Hook for document processing workflow

### 3. Vercel Blob Storage

**Usage:**
- Stores uploaded PDF, JPEG, PNG, TIFF files
- Maximum file size: 50MB
- Private access (authentication required)
- Files stored at: `ocr-documents/{userId}/{timestamp}-{filename}`

### 4. Python Backend Service

**Requirements:**
- Python 3.8+
- Tesseract OCR engine
- spaCy NLP library

**Setup:**

1. **Install System Dependencies (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr libtesseract-dev
```

2. **Install Python Dependencies:**
```bash
cd scripts
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. **Environment Variables:**
```bash
export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
export BACKEND_API_URL=http://localhost:5000
export PORT=5000
```

4. **Start Backend Service:**
```bash
cd scripts
python backend_service.py
```

The service will start on `http://localhost:5000`

**API Endpoints:**
- `GET /health` - Health check
- `POST /process` - Process document (OCR + NER)
- `GET /status/:documentId` - Get processing status

### 5. Database Schema Details

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT,
  file_path TEXT (URL from Vercel Blob),
  file_size INT,
  file_type TEXT,
  status TEXT ('pending', 'processing', 'completed', 'failed'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### OCR Results Table
```sql
CREATE TABLE ocr_results (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id),
  raw_text TEXT,
  confidence DECIMAL (0-100),
  page_count INT,
  processing_time_ms INT,
  created_at TIMESTAMP
);
```

#### Extracted Entities Table
```sql
CREATE TABLE extracted_entities (
  id UUID PRIMARY KEY,
  ocr_result_id UUID REFERENCES ocr_results(id),
  entity_type TEXT (PERSON, ORG, GPE, DATE, AMOUNT, etc),
  entity_text TEXT,
  confidence DECIMAL (0-100),
  start_position INT,
  end_position INT,
  created_at TIMESTAMP
);
```

#### Claims Table
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  document_id UUID REFERENCES documents(id),
  claimant_name TEXT,
  claimant_address TEXT,
  forest_area TEXT,
  claim_type TEXT,
  claim_status TEXT ('pending', 'verified', 'rejected'),
  extracted_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Processing Workflow

1. **User uploads document** → Frontend stores in Vercel Blob, creates record in `documents` table
2. **Status set to "pending"** → Frontend calls backend API
3. **Backend processes document:**
   - Downloads from Blob storage
   - Runs Tesseract OCR on image
   - Saves OCR results to `ocr_results` table
   - Runs spaCy NER on extracted text
   - Saves entities to `extracted_entities` table
   - Updates document status to "completed"
4. **Frontend polls for completion** → Fetches OCR results and entities
5. **User reviews and saves claim** → Creates record in `claims` table

## Row Level Security (RLS)

All tables have RLS enabled to ensure users can only access their own data:
- Users can only view/modify their own documents and claims
- Service role has full access for backend processing
- Admin users can view all claims

## Troubleshooting

### OCR Not Working
- Ensure Tesseract is installed: `tesseract --version`
- Check file format is supported (PDF, JPEG, PNG, TIFF)
- Verify image quality and resolution

### NER Extraction Issues
- Ensure spaCy model is downloaded: `python -m spacy download en_core_web_sm`
- Check text contains recognizable entities
- Verify language is English (other languages need different models)

### Backend Connection Issues
- Verify `BACKEND_API_URL` environment variable is set correctly
- Check backend service is running on specified port
- Verify Supabase credentials are correct

## Performance Optimization

### For Large Documents:
1. **Increase timeout:** Adjust polling attempts in `useDocumentProcessor.ts`
2. **Batch processing:** Use batch endpoint to process multiple documents
3. **Caching:** Cache OCR results for frequently accessed documents

### For High Load:
1. **Use job queue:** Consider Celery/RQ for async processing
2. **Database indexing:** Already included in schema
3. **Load balancing:** Run multiple backend instances

## Security Considerations

1. **File Validation:** Only PDF, JPEG, PNG, TIFF allowed, max 50MB
2. **Authentication:** All endpoints require Supabase auth
3. **RLS Policies:** Database enforces user isolation
4. **Private Storage:** Files stored privately in Blob storage
5. **Service Role:** Backend only accesses database with service role key

## Deployment

### Deploy Frontend to Vercel:
```bash
vercel deploy
```

### Deploy Backend to Cloud:
- **Heroku:** `heroku create` → push Python code
- **AWS EC2:** Install dependencies, run gunicorn
- **Google Cloud Run:** Containerize with Docker
- **Railway:** Direct git connection

Example Heroku Procfile:
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT scripts.backend_service:app
```

## Support

For issues or questions:
1. Check logs in `console.log("[v0] ...")` statements
2. Verify all environment variables are set
3. Test backend API with curl: `curl http://localhost:5000/health`
4. Check Supabase dashboard for database issues
