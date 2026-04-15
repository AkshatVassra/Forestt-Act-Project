# Custom Tesseract Model Integration Guide

## Overview

Your backend now supports custom Tesseract OCR models trained for specific document types and languages. This guide explains how to integrate your custom `.traineddata` file.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── config.py         # Configuration (custom model path)
│   ├── pipeline.py       # OCR pipeline with custom model support
│   ├── ner.py           # Named Entity Recognition
│   ├── models.py        # Database models
│   ├── db.py            # Database client
│   └── schemas.py       # Pydantic schemas
├── models/              # Place your .traineddata files here
│   └── your_model.traineddata
├── requirements.txt     # Python dependencies
└── run.py              # Application launcher
```

## Step 1: Prepare Your Custom Model

### Model File Requirements
- **Format**: `.traineddata` file (Tesseract trained model)
- **Location**: Place in `backend/models/` directory
- **Naming**: Use meaningful names like `forest_claims.traineddata`, `land_documents.traineddata`, etc.

### Example File Structure
```
backend/models/
├── custom_forest.traineddata
├── custom_hindi.traineddata
└── custom_multilingual.traineddata
```

## Step 2: Configure the Model Path

### Option 1: Environment Variable (Recommended for Production)

Create or update `.env` file in the backend directory:

```env
# Database Configuration
DB_BACKEND=postgres
POSTGRES_URL=postgresql+psycopg2://user:password@localhost:5432/pdf_pipeline

# Tesseract Configuration
TESSERACT_CMD=/usr/bin/tesseract  # Path to tesseract binary (optional)
CUSTOM_TESSERACT_MODEL=models/custom_forest.traineddata

# OCR Processing Settings
PDF_DPI=300              # Higher DPI = better quality but slower
OCR_UPSCALE_FACTOR=2.0   # Image upscaling before OCR

# Other settings
SPACY_MODEL=en_core_web_sm
MAX_UPLOAD_SIZE_MB=20
```

### Option 2: Direct Configuration

Edit `backend/app/config.py`:

```python
class Settings(BaseSettings):
    # ... other settings ...
    custom_tesseract_model: str = "models/custom_forest.traineddata"
    pdf_dpi: int = 300
    ocr_upscale_factor: float = 2.0
```

## Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Key Dependencies for Custom Models
- **pytesseract**: Python wrapper for Tesseract
- **opencv-python**: Image processing
- **pymupdf (fitz)**: PDF rendering
- **spacy**: Named Entity Recognition
- **fastapi**: Web framework
- **pydantic**: Data validation

## Step 4: Start the Backend Server

```bash
# From the backend directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`

### Health Check
```bash
curl http://localhost:8000/health
# Response: {"status": "ok", "db_backend": "postgres"}
```

## Step 5: Test Custom Model OCR

### Using cURL

```bash
curl -X POST "http://localhost:8000/process-pdf" \
  -F "file=@sample_document.pdf"
```

### Using Python

```python
import requests

files = {"file": open("sample_document.pdf", "rb")}
response = requests.post("http://localhost:8000/process-pdf", files=files)
print(response.json())
```

### Expected Response

```json
{
  "status": "success",
  "filename": "sample_document.pdf",
  "document_id": "12345",
  "text_file_path": "/tmp/sample_document_ocr_sample.txt",
  "entities": {
    "PERSON": ["John Doe"],
    "ORG": ["Forest Authority"],
    "GPE": ["India"],
    "DATE": ["2024-01-15"],
    "AMOUNT": ["500 hectares"]
  },
  "relations_count": 8
}
```

## How Custom Models Work

### OCR Pipeline Flow

1. **PDF Upload** → File received and validated
2. **PDF to Images** → Each page rendered at configured DPI (300 default)
3. **Image Enhancement** → Preprocessing for better OCR:
   - Upscaling (2x default)
   - Denoising
   - Thresholding (OTSU)
4. **OCR Processing** → Uses your custom model if configured
5. **NER Extraction** → Extract entities from OCR text using spaCy
6. **Relation Extraction** → Find relationships between entities
7. **Database Storage** → Save results to PostgreSQL or MongoDB
8. **Response** → Return structured data to client

### Model Selection Logic

```python
if custom_tesseract_model is configured:
    use custom_model_name  # From .traineddata filename
else:
    use default "eng" model  # English fallback
```

**Example**: If model path is `models/custom_forest.traineddata`:
- Model name extracted: `custom_forest`
- Tesseract uses: `--psm 3 -l custom_forest`

## Supported Tesseract Languages & Models

### Built-in Models
- English: `eng`
- Hindi: `hin`
- And 100+ other languages

### Custom Models (Your Files)
Any `.traineddata` file you trained with Tesseract training tools.

## Configuration Tuning

### For Better Quality (Slower)
```python
PDF_DPI=600              # Higher resolution
OCR_UPSCALE_FACTOR=3.0   # More upscaling
```

### For Faster Processing (Lower Quality)
```python
PDF_DPI=150              # Lower resolution
OCR_UPSCALE_FACTOR=1.0   # No upscaling
```

## Troubleshooting

### Issue: "Model not found"
**Solution**: Ensure the `.traineddata` file exists at the specified path:
```bash
ls -la backend/models/your_model.traineddata
```

### Issue: "Tesseract not installed"
**Solution**: Install Tesseract:
```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### Issue: Low OCR accuracy
**Solution**:
1. Increase DPI: `PDF_DPI=600`
2. Increase upscaling: `OCR_UPSCALE_FACTOR=3.0`
3. Verify model is trained for your document type
4. Check that PDF quality is good

### Issue: Performance is slow
**Solution**:
1. Reduce DPI: `PDF_DPI=200`
2. Reduce upscaling: `OCR_UPSCALE_FACTOR=1.0`
3. Use smaller PDFs for testing

## Production Deployment

### Docker Setup

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Install Tesseract
RUN apt-get update && apt-get install -y tesseract-ocr && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy files
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copy custom models
COPY models/ ./models/

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t forest-ocr-backend .
docker run -p 8000:8000 -e CUSTOM_TESSERACT_MODEL="models/custom_forest.traineddata" forest-ocr-backend
```

## Integration with Frontend

The frontend (`/src/api/upload.ts`) will automatically use this backend when `BACKEND_API_URL` is configured:

```env
# Frontend .env
VITE_BACKEND_API_URL=http://localhost:8000
# or for production:
# VITE_BACKEND_API_URL=https://your-api.example.com
```

## Database Integration

OCR results are automatically stored in:

### PostgreSQL Table
```sql
CREATE TABLE processed_documents (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  text_file_path VARCHAR(1024),
  ocr_text TEXT,
  entities JSONB,
  relations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB Collection
```javascript
db.processed_documents.insertOne({
  filename: "...",
  text_file_path: "...",
  ocr_text: "...",
  entities: {...},
  relations: [...]
})
```

## Performance Metrics

### Typical Processing Times
- Single page PDF: 2-5 seconds
- 10-page document: 20-50 seconds
- Custom model overhead: < 500ms

### Memory Usage
- Tesseract instance: ~100-200 MB
- spaCy NER model: ~50-100 MB
- Total per request: ~200-300 MB

## Next Steps

1. **Test with sample documents** before production use
2. **Monitor OCR quality** on your document types
3. **Fine-tune DPI and upscaling** based on results
4. **Set up error logging** for production
5. **Configure database backups** for results storage

---

**Questions?** Check the main `BACKEND_IMPLEMENTATION.md` for architecture details.
