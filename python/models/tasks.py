"""
Modelos Pydantic para tarefas.

Este módulo define os schemas de validação para dados de tarefas.
"""

from typing import Optional, List
from datetime import date
from pydantic import BaseModel, Field


class SubtaskCreate(BaseModel):
    """Schema para criação de subtarefa."""
    
    titulo: str = Field(..., min_length=1, max_length=200)
    concluida: bool = Field(default=False)


class SubtaskUpdate(BaseModel):
    """Schema para atualização de subtarefa."""
    
    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    concluida: Optional[bool] = None


class TaskCreate(BaseModel):
    """
    Schema para criação de tarefa.

    Attributes:
        titulo: Título da tarefa (obrigatório)
        descricao: Descrição detalhada da tarefa (opcional)
        status: Status da tarefa (padrão: 'pendente')
        categoria_id: ID da categoria (opcional)
        data_vencimento: Data de vencimento (opcional)
    """

    titulo: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(default="pendente")
    categoria_id: Optional[int] = None
    data_vencimento: Optional[date] = None

    class Config:
        """Configuração do modelo Pydantic."""

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
    """
    Schema para atualização de tarefa.

    Todos os campos são opcionais para permitir atualização parcial.

    Attributes:
        titulo: Novo título da tarefa
        descricao: Nova descrição da tarefa
        status: Novo status da tarefa
        categoria_id: Nova categoria da tarefa
        data_vencimento: Nova data de vencimento
    """

    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = None
    categoria_id: Optional[int] = None
    data_vencimento: Optional[date] = None

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "titulo": "Comprar pão e leite",
                "descricao": "Ir à padaria e ao mercado",
                "status": "concluida",
                "categoria_id": 2,
                "data_vencimento": "2026-01-26"
            }
        }


class CategoryCreate(BaseModel):
    """Schema para criação de categoria."""
    
    nome: str = Field(..., min_length=1, max_length=100)
    cor: Optional[str] = Field(default="#F97316", max_length=7)

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "nome": "Trabalho",
                "cor": "#3B82F6"
            }
        }


class CategoryUpdate(BaseModel):
    """Schema para atualização de categoria."""
    
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    cor: Optional[str] = Field(None, max_length=7)