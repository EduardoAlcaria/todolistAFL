"""
Gerenciamento de conexão com banco de dados.

Este módulo fornece funções para obter conexões com o banco SQLite.
"""

from asyncio.log import logger
from http.client import HTTPException
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

    try:
        conn = sqlite3.connect("todolist.db")
        conn.row_factory = sqlite3.Row
        yield conn
    except sqlite3.Error as e:
        logger.error(f"Erro ao conectar ao banco: {e}")
        raise HTTPException(500, "Erro interno do servidor")
    finally:
        if conn:
            conn.close()