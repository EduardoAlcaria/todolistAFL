"""
Repositório de categorias.

Este módulo contém funções para acessar e manipular dados de categorias
no banco de dados.
"""

import sqlite3
from typing import List, Optional


def get_categories_by_user(
    conn: sqlite3.Connection,
    user_id: int
) -> List[sqlite3.Row]:
    """
    Busca todas as categorias de um usuário.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário

    Returns:
        List[sqlite3.Row]: Lista de categorias do usuário
    """
    cursor = conn.execute(
        "SELECT * FROM categories WHERE user_id = ? ORDER BY nome",
        (user_id,)
    )
    return cursor.fetchall()


def create_category(
    conn: sqlite3.Connection,
    user_id: int,
    nome: str,
    cor: str
) -> int:
    """
    Cria uma nova categoria no banco de dados.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário proprietário da categoria
        nome: Nome da categoria
        cor: Cor em hexadecimal da categoria

    Returns:
        int: ID da categoria criada
    """
    cursor = conn.execute(
        "INSERT INTO categories (user_id, nome, cor) VALUES (?, ?, ?)",
        (user_id, nome, cor)
    )
    conn.commit()
    return cursor.lastrowid


def update_category(
    conn: sqlite3.Connection,
    category_id: int,
    user_id: int,
    nome: str,
    cor: str
) -> None:
    """
    Atualiza uma categoria existente.

    Args:
        conn: Conexão com o banco de dados
        category_id: ID da categoria a ser atualizada
        user_id: ID do usuário (para verificar propriedade)
        nome: Novo nome da categoria
        cor: Nova cor da categoria

    Note:
        A atualização só ocorre se a categoria pertencer ao usuário.
    """
    conn.execute(
        """
        UPDATE categories
        SET nome = ?, cor = ?
        WHERE id = ? AND user_id = ?
        """,
        (nome, cor, category_id, user_id)
    )
    conn.commit()


def delete_category(
    conn: sqlite3.Connection,
    category_id: int,
    user_id: int
) -> None:
    """
    Exclui uma categoria do banco de dados.

    Args:
        conn: Conexão com o banco de dados
        category_id: ID da categoria a ser excluída
        user_id: ID do usuário (para verificar propriedade)

    Note:
        A exclusão só ocorre se a categoria pertencer ao usuário.
    """
    conn.execute(
        "DELETE FROM categories WHERE id = ? AND user_id = ?",
        (category_id, user_id)
    )
    conn.commit()


def get_category_by_id(
    conn: sqlite3.Connection,
    category_id: int,
    user_id: int
) -> Optional[sqlite3.Row]:
    """
    Busca uma categoria específica pelo ID.

    Args:
        conn: Conexão com o banco de dados
        category_id: ID da categoria
        user_id: ID do usuário (para verificar propriedade)

    Returns:
        sqlite3.Row: Dados da categoria se encontrada, None caso contrário
    """
    cursor = conn.execute(
        "SELECT * FROM categories WHERE id = ? AND user_id = ?",
        (category_id, user_id)
    )
    return cursor.fetchone()