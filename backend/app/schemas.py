from pydantic import BaseModel


class ProcessPDFResponse(BaseModel):
    status: str
    filename: str
    document_id: str
    text_file_path: str
    entities: dict
    relations_count: int
