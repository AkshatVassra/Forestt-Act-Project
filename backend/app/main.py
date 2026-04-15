from fastapi import FastAPI, File, HTTPException, UploadFile

from app.config import settings
from app.db import db_client
from app.pipeline import process_pdf_bytes
from app.schemas import ProcessPDFResponse

app = FastAPI(title="PDF OCR + NER Pipeline")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "db_backend": settings.db_backend}


@app.post("/process-pdf", response_model=ProcessPDFResponse)
async def process_pdf(file: UploadFile = File(...)) -> ProcessPDFResponse:
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported")

    pdf_bytes = await file.read()
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(pdf_bytes) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max allowed size is {settings.max_upload_size_mb} MB.",
        )

    try:
        result = process_pdf_bytes(pdf_bytes, file.filename)
        document_id = db_client.save_document(
            filename=file.filename,
            text_file_path=result["text_file_path"],
            ocr_text=result["ocr_text"],
            entities=result["entities"],
            relations=result["relations"],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}") from exc

    return ProcessPDFResponse(
        status="success",
        filename=file.filename,
        document_id=document_id,
        text_file_path=result["text_file_path"],
        entities=result["entities"],
        relations_count=len(result["relations"]),
    )
