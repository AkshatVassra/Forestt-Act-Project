import tempfile
from pathlib import Path

import cv2
import fitz
import numpy as np
import pytesseract

from app.config import settings
from app.ner import extract_entities_and_relations


if settings.tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd


def _render_pdf_page_to_image(page: fitz.Page, dpi: int = 300) -> np.ndarray:
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=matrix, alpha=False)
    image = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    return cv2.cvtColor(image, cv2.COLOR_RGB2BGR)


def _enhance_for_ocr(image_bgr: np.ndarray, upscale_factor: float = 2.0) -> np.ndarray:
    # Upscale low-quality scans before OCR.
    upscaled = cv2.resize(
        image_bgr,
        None,
        fx=upscale_factor,
        fy=upscale_factor,
        interpolation=cv2.INTER_CUBIC,
    )
    gray = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=20)
    _, thresholded = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresholded


def _ocr_image(image: np.ndarray) -> str:
    """
    Perform OCR using custom Tesseract model if configured, otherwise use default English model.
    """
    if settings.custom_tesseract_model:
        # Use custom trained model
        # Format: lang_prefix from the .traineddata filename (e.g., for 'custom_forest.traineddata', use 'custom_forest')
        model_name = Path(settings.custom_tesseract_model).stem
        try:
            return pytesseract.image_to_string(image, lang=model_name)
        except Exception as e:
            print(f"[v0] Warning: Custom model {model_name} failed, falling back to English: {e}")
            return pytesseract.image_to_string(image, lang="eng")
    else:
        # Use default English model
        return pytesseract.image_to_string(image, lang="eng")


def process_pdf_bytes(pdf_bytes: bytes, original_filename: str) -> dict:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text = []

    try:
        for page_index in range(len(doc)):
            page = doc[page_index]
            rendered_image = _render_pdf_page_to_image(page, dpi=settings.pdf_dpi)
            enhanced_image = _enhance_for_ocr(rendered_image, upscale_factor=settings.ocr_upscale_factor)
            page_text = _ocr_image(enhanced_image)
            pages_text.append(f"===== PAGE {page_index + 1} =====\n{page_text.strip()}\n")
    finally:
        doc.close()

    combined_text = "\n".join(pages_text).strip()

    with tempfile.NamedTemporaryFile(
        mode="w",
        prefix=f"{Path(original_filename).stem}_",
        suffix="_ocr_sample.txt",
        delete=False,
        encoding="utf-8",
    ) as temp_file:
        temp_file.write(combined_text)
        temp_text_path = temp_file.name

    entities, relations = extract_entities_and_relations(combined_text)

    return {
        "ocr_text": combined_text,
        "text_file_path": temp_text_path,
        "entities": entities,
        "relations": relations,
    }
