from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_backend: str = "postgres"
    postgres_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/pdf_pipeline"
    mongo_url: str = "mongodb://localhost:27017/"
    mongo_db_name: str = "pdf_pipeline"
    tesseract_cmd: str = ""
    # Custom Tesseract model path - set to your .traineddata file path
    custom_tesseract_model: str = ""  # e.g., "models/custom_model.traineddata"
    spacy_model: str = "en_core_web_sm"
    max_upload_size_mb: int = 20
    # PDF rendering DPI for better OCR quality
    pdf_dpi: int = 300
    # Image upscaling factor for OCR preprocessing
    ocr_upscale_factor: float = 2.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
