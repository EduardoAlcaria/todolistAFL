"""
Modelos Pydantic para usuários.

Este módulo define os schemas de validação para dados de usuários.
"""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """
    Schema para criação de usuário.

    Attributes:
        email: Email do usuário (validado como email válido)
        password: Senha do usuário
    """

    email: EmailStr
    password: str

    class Config:
        """Configuração do modelo Pydantic."""

        json_schema_extra = {
            "example": {
                "email": "usuario@exemplo.com",
                "password": "senha123"
            }
        }