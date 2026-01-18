"""
Modelos Pydantic para tarefas.

Este módulo define os schemas de validação para dados de tarefas.
"""

from typing import Optional
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """
    Schema para criação de tarefa.

    Attributes:
        titulo: Título da tarefa (obrigatório)
        descricao: Descrição detalhada da tarefa (opcional)
        status: Status da tarefa (padrão: 'pendente')
    """

    titulo: str = Field(..., min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(default="pendente")

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "titulo": "Comprar pão",
                "descricao": "Ir à padaria da esquina",
                "status": "pendente"
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
    """

    titulo: Optional[str] = Field(None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = None

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "titulo": "Comprar pão e leite",
                "descricao": "Ir à padaria e ao mercado",
                "status": "concluida"
            }
        }