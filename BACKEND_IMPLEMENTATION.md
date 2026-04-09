# Backend System Implementation Summary

## ✅ Completed Components

### 1. Database Schema (Supabase PostgreSQL)
**File:** `scripts/01_create_schema.sql`

- **documents** table - Tracks uploaded files and processing status
- **ocr_results** table - Stores text extraction results with confidence scores
- **extracted_entities** table - Stores NER results (PERSON, ORG, GPE, DATE, AMOUNT, etc.)
- **claims** table - Stores final extracted claim information
- **Row Level Security (RLS)** - Users can only access their own data
- **Indexes** - Performance optimized for common queries

### 2. API Layer
**File:** `src/api/upload.ts`

**Functions:**
- `uploadDocument()` - Upload to Blob storage, create database record
- `processDocument()` - Trigger backend processing
- `getDocumentStatus()` - Check processing progress
- `getOCRResults()` - Fetch extracted text
- `getExtractedEntities()` - Fetch identified entities
- `saveClaim()` - Save finalized claim to database

**File Validation:**
- Allowed types: PDF, JPEG, PNG, TIFF
- Maximum size: 50MB
- Error handling and validation

### 3. Python Backend Service
**File:** `scripts/backend_service.py`

**Components:**

#### OCRProcessor Class
```python
- extract_text_from_image() - Tesseract OCR extraction
- _preprocess_image() - Image enhancement for better OCR
- Returns: raw_text, confidence, processing_time_ms
```

#### NERExtractor Class
```python
- extract_entities() - spaCy NLP entity recognition
- Returns: List of entities with type, text, position, confidence
```

#### DocumentProcessor Class
```python
- process_document() - Orchestrates full workflow
  1. Fetch document from database
  2. Download from Blob storage
  3. Run OCR extraction
  4. Save OCR results
  5. Run NER extraction
  6. Save entities
  7. Update status to completed
```

**Flask API Endpoints:**
- `GET /health` - Service health check
- `POST /process` - Process document (OCR + NER)
- `GET /status/:documentId` - Get processing status

### 4. Frontend Hook
**File:** `src/hooks/useDocumentProcessor.ts`

**Features:**
- File upload with progress tracking
- Polling for processing status
- Automatic retry with configurable attempts
- State management for upload workflow
- Error handling and user feedback

**State Properties:**
- `documentId` - Current document being processed
- `status` - 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
- `progress` - 0-100 percentage
- `ocrResults` - Text extraction data
- `entities` - Named entities found
- `error` - Error message if any

### 5. Data Viewer Component
**File:** `src/components/ExtractedDataViewer.tsx`

**Features:**
- Display OCR results with confidence scores
- Group entities by type (PERSON, ORG, GPE, DATE, AMOUNT)
- Show processing statistics
- Copy to clipboard functionality
- Download as JSON export
- Save as claim button for database storage

### 6. Documentation
- `BACKEND_SETUP.md` - Complete setup instructions
- `BACKEND_IMPLEMENTATION.md` - This file

## 🔄 Data Flow

```
User Action
    ↓
[Upload Document]
    ↓
Frontend: Upload to Vercel Blob
    ↓
Frontend: Create record in Supabase documents table (status: pending)
    ↓
Frontend: Call backend /process endpoint
    ↓
[Backend Processing]
    ↓
Backend: Download from Blob storage
    ↓
Backend: Run Tesseract OCR → save to ocr_results table
    ↓
Backend: Run spaCy NER → save to extracted_entities table
    ↓
Backend: Update document status to "completed"
    ↓
[Results Display]
    ↓
Frontend: Poll /status endpoint
    ↓
When completed: Fetch OCR results and entities
    ↓
Display in ExtractedDataViewer component
    ↓
User Reviews & Saves as Claim
    ↓
Record saved to claims table with extracted data
```

## 🔐 Security Features

1. **Authentication**: All endpoints require Supabase auth
2. **File Validation**: 
   - Only allowed file types (PDF, JPEG, PNG, TIFF)
   - Maximum 50MB file size
   - MIME type verification
3. **Private Storage**: Files stored privately in Vercel Blob
4. **Row Level Security**: Database RLS policies
   - Users see only their own documents
   - Admins can view all claims
5. **Service Role**: Backend only accesses database with restricted service role key

## 📊 Database Schema Relationships

```
┌─────────────────┐
│   documents     │ (user's uploaded files)
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ file_path       │ → Vercel Blob URL
│ status          │ → pending|processing|completed|failed
│ created_at      │
└────────┬────────┘
         │
         │ 1:1
         ↓
┌──────────────────────┐
│    ocr_results       │ (extracted text)
├──────────────────────┤
│ id (PK)              │
│ document_id (FK)     │
│ raw_text             │
│ confidence (0-100)   │
│ processing_time_ms   │
└────────┬─────────────┘
         │
         │ 1:N
         ↓
┌───────────────────────────┐
│   extracted_entities      │ (NER results)
├───────────────────────────┤
│ id (PK)                   │
│ ocr_result_id (FK)        │
│ entity_type               │ PERSON|ORG|GPE|DATE|AMOUNT
│ entity_text               │
│ confidence (0-100)        │
│ start_position            │
│ end_position              │
└───────────────────────────┘

┌──────────────────┐
│     claims       │ (finalized claims)
├──────────────────┤
│ id (PK)          │
│ user_id (FK)     │
│ document_id (FK) │
│ claimant_name    │
│ forest_area      │
│ claim_type       │
│ extracted_data   │ JSONB (stores all entities)
│ claim_status     │
└──────────────────┘
```

## 📋 Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
POSTGRES_URL=postgresql://user:password@host/database

# Vercel Blob
BLOB_READ_WRITE_TOKEN=xxxxx

# Backend
BACKEND_API_URL=http://localhost:5000  # or deployed URL
```

## 🚀 Deployment Checklist

### Frontend (Vercel)
- [ ] Set all environment variables in Vercel dashboard
- [ ] Deploy with `vercel deploy`
- [ ] Test file uploads and processing

### Backend (Python Service)
- [ ] Install system dependencies (tesseract-ocr)
- [ ] Install Python dependencies: `pip install -r scripts/requirements.txt`
- [ ] Download spaCy model: `python -m spacy download en_core_web_sm`
- [ ] Set environment variables
- [ ] Deploy to: Heroku, AWS, Google Cloud Run, Railway, etc.
- [ ] Configure firewall to allow requests from frontend

### Database (Supabase)
- [ ] Execute schema migration SQL
- [ ] Verify RLS policies are enabled
- [ ] Test user isolation with multiple accounts
- [ ] Configure backups

## 🧪 Testing the System

### 1. Test Upload
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test.pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test Backend Processing
```bash
curl -X POST http://localhost:5000/process \
  -H "Content-Type: application/json" \
  -d '{"documentId": "document-uuid"}'
```

### 3. Check Status
```bash
curl http://localhost:5000/status/document-uuid
```

### 4. Verify Database
```sql
SELECT * FROM documents WHERE user_id = 'user-uuid';
SELECT * FROM ocr_results WHERE document_id = 'doc-uuid';
SELECT * FROM extracted_entities WHERE ocr_result_id = 'ocr-uuid';
```

## 📈 Performance Metrics

### Typical Processing Time
- Document upload: 1-2 seconds
- OCR processing: 5-30 seconds (depends on image quality and size)
- NER extraction: 1-5 seconds
- Database operations: <100ms each

### Optimization Tips
1. Image preprocessing improves OCR accuracy
2. Batch processing multiple documents saves time
3. Database indexes speed up queries
4. Cache OCR results for repeated documents

## 🔮 Future Enhancements

1. **Multi-language Support**
   - Add Hindi, Tamil, Telugu, Odia, Bhojpuri language models
   - Configuration in settings

2. **Async Processing**
   - Use Celery/RQ for background job queue
   - Send notifications when complete

3. **Advanced NER**
   - Custom spaCy models trained on FRA documents
   - Fine-tune for forest-related entities

4. **Document Verification**
   - Confidence scoring and manual review workflow
   - Admin dashboard for claim verification

5. **Analytics**
   - Processing statistics and trends
   - Success rates by document type
   - User activity reports

6. **API Rate Limiting**
   - Prevent abuse
   - Quotas per user

## 📝 Notes

- All OCR/NER runs are non-destructive (original files preserved in Blob)
- Processing results are immutable (audit trail maintained)
- Failed documents can be reprocessed
- Admin users have full access to all claims regardless of RLS
- Service role key should never be exposed to frontend

## Support

See `BACKEND_SETUP.md` for detailed setup instructions and troubleshooting.
