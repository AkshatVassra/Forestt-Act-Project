import { useState, useCallback } from 'react';
import { uploadDocument, processDocument, getDocumentStatus, getOCRResults, getExtractedEntities } from '@/api/upload';

export interface ProcessingState {
  documentId: string | null;
  fileName: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  ocrResults: any | null;
  entities: any[] | null;
  error: string | null;
}

export function useDocumentProcessor(userId: string) {
  const [state, setState] = useState<ProcessingState>({
    documentId: null,
    fileName: null,
    status: 'idle',
    progress: 0,
    ocrResults: null,
    entities: null,
    error: null,
  });

  // Upload document
  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setState(prev => ({ ...prev, status: 'uploading', progress: 0, error: null }));
        
        console.log('[v0] Uploading file:', file.name);
        
        const result = await uploadDocument(file, userId);
        
        setState(prev => ({
          ...prev,
          documentId: result.documentId,
          fileName: result.fileName,
          status: 'processing',
          progress: 25,
        }));

        // Start processing
        await processDocument(result.documentId);
        
        setState(prev => ({ ...prev, progress: 50 }));

        return result.documentId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        console.error('[v0] Upload error:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
        throw error;
      }
    },
    [userId]
  );

  // Poll for document completion
  const pollProcessingStatus = useCallback(
    async (documentId: string, maxAttempts = 120) => {
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          const status = await getDocumentStatus(documentId);
          
          console.log('[v0] Document status:', status.status);
          
          if (status.status === 'completed') {
            // Fetch OCR results
            const ocrResults = await getOCRResults(documentId);
            setState(prev => ({ ...prev, ocrResults, progress: 75 }));

            // Fetch extracted entities
            if (ocrResults?.id) {
              const entities = await getExtractedEntities(ocrResults.id);
              setState(prev => ({
                ...prev,
                entities,
                status: 'completed',
                progress: 100,
              }));
            }
            
            return true;
          }
          
          if (status.status === 'failed') {
            throw new Error('Document processing failed');
          }

          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        } catch (error) {
          console.error('[v0] Status poll error:', error);
          throw error;
        }
      }

      throw new Error('Processing timeout - exceeded maximum attempts');
    },
    []
  );

  // Reset state
  const reset = useCallback(() => {
    setState({
      documentId: null,
      fileName: null,
      status: 'idle',
      progress: 0,
      ocrResults: null,
      entities: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    uploadFile,
    pollProcessingStatus,
    reset,
  };
}
