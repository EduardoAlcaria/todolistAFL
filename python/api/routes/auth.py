"""
Rotas de autenticação.

Este módulo contém os endpoints para registro, login e 
informações do usuário autenticado.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from db.database import get_db
from services.auth_service import register, authenticate
from core.security import create_access_token
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from api.deps import get_current_user
from models.user import UserCreate


router = APIRouter()


@router.post("/register")
def register_user(data: UserCreate, conn=Depends(get_db)):
    """
    Registra um novo usuário no sistema.

    Args:
        data: Dados do usuário (email e senha)
        conn: Conexão com o banco de dados

    Returns:
        dict: Confirmação de registro

    Raises:
        HTTPException: Se o usuário já existir
    """
    if not register(conn, data.email, data.password):
        raise HTTPException(
            status_code=400,
            detail="Usuário já existe"
        )
    return {"ok": True}


@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    conn=Depends(get_db)
):
    """
    Autentica um usuário e retorna um token JWT.

    Args:
        form: Formulário com username (email) e senha
        conn: Conexão com o banco de dados

    Returns:
        dict: Access token e tipo de token

    Raises:
        HTTPException: Se as credenciais forem inválidas
    """
    user = authenticate(conn, form.username, form.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas"
        )

    token = create_access_token(
        {"sub": user["email"]},
        ACCESS_TOKEN_EXPIRE_MINUTES
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_current_user_info(user=Depends(get_current_user)):
    """
    Retorna informações do usuário autenticado.

    Args:
        user: Usuário autenticado (obtido via JWT)

    Returns:
        dict: ID e email do usuário
    """
    return {
        "id": user["id"],
        "email": user["email"]
    }