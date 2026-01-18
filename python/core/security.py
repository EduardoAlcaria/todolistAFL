"""
Funções de segurança.

Este módulo contém funções para hash de senhas e geração de tokens JWT.
"""

from datetime import datetime, timedelta

import bcrypt
import jwt

from core.config import SECRET_KEY, ALGORITHM


def hash_password(password: str) -> str:
    """
    Gera um hash bcrypt da senha fornecida.

    Args:
        password: Senha em texto plano

    Returns:
        str: Hash da senha
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica se a senha corresponde ao hash.

    Args:
        password: Senha em texto plano
        hashed: Hash da senha armazenado

    Returns:
        bool: True se a senha corresponder, False caso contrário
    """
    password_bytes = password.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_minutes: int) -> str:
    """
    Cria um token JWT com os dados fornecidos.

    Args:
        data: Dados a serem codificados no token
        expires_minutes: Tempo de expiração em minutos

    Returns:
        str: Token JWT codificado
    """
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    payload["exp"] = expire

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token