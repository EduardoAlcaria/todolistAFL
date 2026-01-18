from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    status: Optional[str] = "pendente"

class TaskUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    status: Optional[str] = None