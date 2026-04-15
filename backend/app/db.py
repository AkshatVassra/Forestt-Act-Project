from pymongo import MongoClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import Base


class DatabaseClient:
    def __init__(self) -> None:
        self.backend = settings.db_backend.lower()
        self.engine = None
        self.session_local = None
        self.mongo_client = None
        self.mongo_db = None

        if self.backend == "postgres":
            self.engine = create_engine(settings.postgres_url, pool_pre_ping=True)
            self.session_local = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
            Base.metadata.create_all(bind=self.engine)
        elif self.backend == "mongo":
            self.mongo_client = MongoClient(settings.mongo_url)
            self.mongo_db = self.mongo_client[settings.mongo_db_name]
        else:
            raise ValueError("DB_BACKEND must be either 'postgres' or 'mongo'")

    def save_document(
        self,
        filename: str,
        text_file_path: str,
        ocr_text: str,
        entities: dict,
        relations: list,
    ) -> str:
        if self.backend == "postgres":
            return self._save_postgres(filename, text_file_path, ocr_text, entities, relations)
        return self._save_mongo(filename, text_file_path, ocr_text, entities, relations)

    def _save_postgres(
        self,
        filename: str,
        text_file_path: str,
        ocr_text: str,
        entities: dict,
        relations: list,
    ) -> str:
        from app.models import ProcessedDocument

        with self.session_local() as session:
            record = ProcessedDocument(
                filename=filename,
                text_file_path=text_file_path,
                ocr_text=ocr_text,
                entities=entities,
                relations=relations,
            )
            session.add(record)
            session.commit()
            session.refresh(record)
            return str(record.id)

    def _save_mongo(
        self,
        filename: str,
        text_file_path: str,
        ocr_text: str,
        entities: dict,
        relations: list,
    ) -> str:
        payload = {
            "filename": filename,
            "text_file_path": text_file_path,
            "ocr_text": ocr_text,
            "entities": entities,
            "relations": relations,
        }
        result = self.mongo_db.processed_documents.insert_one(payload)
        return str(result.inserted_id)


db_client = DatabaseClient()
