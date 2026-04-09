import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function uploadDocument(
  file: File,
  userId: string
): Promise<{
  documentId: string;
  fileUrl: string;
  fileName: string;
}> {
  try {
    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, JPEG, PNG, and TIFF files are allowed');
    }

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const blobPath = `ocr-documents/${userId}/${timestamp}-${file.name}`;
    
    const blob = await put(blobPath, file, {
      access: 'private',
      addRandomSuffix: false,
    });

    // Create document record in Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: blob.url,
        file_size: file.size,
        file_type: file.type,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      documentId: data.id,
      fileUrl: blob.url,
      fileName: file.name,
    };
  } catch (error) {
    console.error('[v0] Upload error:', error);
    throw error;
  }
}

export async function processDocument(documentId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Update document status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Call backend service for OCR and NER processing
    const response = await fetch(`${process.env.BACKEND_API_URL}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      throw new Error('Backend processing failed');
    }

    return { success: true, message: 'Document processing started' };
  } catch (error) {
    console.error('[v0] Processing error:', error);
    
    // Update status to failed
    await supabase
      .from('documents')
      .update({ status: 'failed' })
      .eq('id', documentId);

    throw error;
  }
}

export async function getDocumentStatus(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('status, updated_at')
      .eq('id', documentId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[v0] Status check error:', error);
    throw error;
  }
}

export async function getOCRResults(documentId: string) {
  try {
    const { data, error } = await supabase
      .from('ocr_results')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[v0] OCR results error:', error);
    throw error;
  }
}

export async function getExtractedEntities(ocrResultId: string) {
  try {
    const { data, error } = await supabase
      .from('extracted_entities')
      .select('*')
      .eq('ocr_result_id', ocrResultId)
      .order('entity_type');

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[v0] Entities error:', error);
    throw error;
  }
}

export async function saveClaim(
  userId: string,
  documentId: string,
  claimData: {
    claimant_name?: string;
    claimant_address?: string;
    forest_area?: string;
    claim_type?: string;
    extracted_data?: any;
  }
) {
  try {
    const { data, error } = await supabase
      .from('claims')
      .insert({
        user_id: userId,
        document_id: documentId,
        ...claimData,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { claimId: data.id };
  } catch (error) {
    console.error('[v0] Claim save error:', error);
    throw error;
  }
}
