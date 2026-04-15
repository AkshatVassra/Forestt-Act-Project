from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ProcessedDocument(Base):
    __tablename__ = "processed_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    text_file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    ocr_text: Mapped[str] = mapped_column(Text, nullable=False)
    entities: Mapped[dict] = mapped_column(JSON, nullable=False)
    relations: Mapped[list] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
