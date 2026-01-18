"""
Serviço de autenticação.

Este módulo contém a lógica de negócio para registro e autenticação
de usuários.
"""

import sqlite3
from typing import Optional

from repositories.user_repo import get_user_by_email, create_user
from core.security import hash_password, verify_password


def register(conn: sqlite3.Connection, email: str, password: str) -> bool:
    """
    Registra um novo usuário no sistema.

    Args:
        conn: Conexão com o banco de dados
        email: Email do usuário
        password: Senha em texto plano

    Returns:
        bool: True se o registro foi bem-sucedido, False se o usuário já existe
    """
    # Verifica se o usuário já existe
    if get_user_by_email(conn, email):
        return False

    # Cria hash da senha e salva o usuário
    password_hash = hash_password(password)
    create_user(conn, email, password_hash)

    return True


def authenticate(
    conn: sqlite3.Connection,
    email: str,
    password: str
) -> Optional[sqlite3.Row]:
    """
    Autentica um usuário verificando email e senha.

    Args:
        conn: Conexão com o banco de dados
        email: Email do usuário
        password: Senha em texto plano

    Returns:
        sqlite3.Row: Dados do usuário se autenticado, None caso contrário
    """
    user = get_user_by_email(conn, email)

    # Verifica se o usuário existe
    if not user:
        return None

    # Verifica se a senha está correta
    if not verify_password(password, user["password_hash"]):
        return None

    return user