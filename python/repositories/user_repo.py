"""
Repositório de usuários.

Este módulo contém funções para acessar e manipular dados de usuários
no banco de dados.
"""

import sqlite3
from typing import Optional


def get_user_by_email(conn: sqlite3.Connection, email: str) -> Optional[sqlite3.Row]:
    """
    Busca um usuário pelo email.

    Args:
        conn: Conexão com o banco de dados
        email: Email do usuário a ser buscado

    Returns:
        sqlite3.Row: Dados do usuário se encontrado, None caso contrário
    """
    cursor = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )
    return cursor.fetchone()


def create_user(conn: sqlite3.Connection, email: str, password_hash: str) -> None:
    """
    Cria um novo usuário no banco de dados.

    Args:
        conn: Conexão com o banco de dados
        email: Email do usuário
        password_hash: Hash da senha do usuário

    Note:
        A transação é automaticamente commitada após a inserção.
    """
    conn.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (email, password_hash)
    )
    conn.commit()