"""
Modelos Pydantic para tarefas.
"""

from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator


class SubtaskCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    concluida: bool = Field(default=False)


class SubtaskUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    concluida: Optional[bool] = None


class TaskCreate(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(default="pendente")
    categoria_id: Optional[int] = None
    data_vencimento: Optional[date] = None

    @field_validator('data_vencimento')
    @classmethod
    def validate_data_vencimento(cls, v):
        if v is not None and v < date.today():
            raise ValueError('Data de vencimento não pode ser no passado')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "titulo": "Comprar pão",
                "descricao": "Ir à padaria da esquina",
                "status": "pendente",
                "categoria_id": 1,
                "data_vencimento": "2026-01-25"
            }
        }


class TaskUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = None
    categoria_id: Optional[int] = None
    data_vencimento: Optional[date] = None

    @field_validator('data_vencimento')
    @classmethod
    def validate_data_vencimento(cls, v):
        if v is not None and v < date.today():
            raise ValueError('Data de vencimento não pode ser no passado')
        return v


class CategoryCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    cor: Optional[str] = Field(default="#F97316", max_length=7)

    @field_validator('cor')
    @classmethod
    def validate_cor(cls, v):
        if not v.startswith('#') or len(v) != 7:
            raise ValueError('Cor deve estar no formato hexadecimal (#RRGGBB)')
        return v


class CategoryUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    cor: Optional[str] = Field(None, max_length=7)

    @field_validator('cor')
    @classmethod
    def validate_cor(cls, v):
        if v is not None and (not v.startswith('#') or len(v) != 7):
            raise ValueError('Cor deve estar no formato hexadecimal (#RRGGBB)')
        return v