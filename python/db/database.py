"""
Gerenciamento de conexão com banco de dados.

Este módulo fornece funções para obter conexões com o banco SQLite.
"""

import sqlite3
from typing import Generator


def get_db() -> Generator:
    """
    Cria e gerencia uma conexão com o banco de dados SQLite.

    Yields:
        sqlite3.Connection: Conexão com o banco de dados

    Note:
        A conexão é automaticamente fechada após o uso.
        Row factory configurado para retornar dicionários.
    """
    conn = sqlite3.connect("todolist.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()