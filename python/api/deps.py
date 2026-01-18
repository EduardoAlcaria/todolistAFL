"""
Dependências da aplicação.

Este módulo contém funções de dependência usadas em toda a aplicação,
principalmente para autenticação e autorização.
"""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from core.config import SECRET_KEY, ALGORITHM
from db.database import get_db
from repositories.user_repo import get_user_by_email


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    """
    Obtém o usuário atual a partir do token JWT.

    Args:
        token: Token JWT do header Authorization
        conn: Conexão com o banco de dados

    Returns:
        dict: Dados do usuário autenticado

    Raises:
        HTTPException: Se o token for inválido ou o usuário não existir
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = get_user_by_email(conn, email)
    if user is None:
        raise credentials_exception

    return user