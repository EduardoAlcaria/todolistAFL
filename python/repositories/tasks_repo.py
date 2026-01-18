"""
Repositório de tarefas.

Este módulo contém funções para acessar e manipular dados de tarefas
no banco de dados.
"""

import sqlite3
from typing import List, Optional


def get_tasks_by_user(conn: sqlite3.Connection, user_id: int) -> List[sqlite3.Row]:
    """
    Busca todas as tarefas de um usuário.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário

    Returns:
        List[sqlite3.Row]: Lista de tarefas do usuário
    """
    cursor = conn.execute(
        "SELECT * FROM tasks WHERE user_id = ? ORDER BY data_criacao DESC",
        (user_id,)
    )
    return cursor.fetchall()


def create_task(
    conn: sqlite3.Connection,
    user_id: int,
    titulo: str,
    descricao: str,
    status: str
) -> int:
    """
    Cria uma nova tarefa no banco de dados.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário proprietário da tarefa
        titulo: Título da tarefa
        descricao: Descrição da tarefa
        status: Status da tarefa (pendente, concluida, etc)

    Returns:
        int: ID da tarefa criada
    """
    cursor = conn.execute(
        """
        INSERT INTO tasks (user_id, titulo, descricao, status)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, titulo, descricao, status)
    )
    conn.commit()
    return cursor.lastrowid


def update_task(
    conn: sqlite3.Connection,
    task_id: int,
    user_id: int,
    titulo: str,
    descricao: str,
    status: str
) -> None:
    """
    Atualiza uma tarefa existente.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa a ser atualizada
        user_id: ID do usuário (para verificar propriedade)
        titulo: Novo título da tarefa
        descricao: Nova descrição da tarefa
        status: Novo status da tarefa

    Note:
        A atualização só ocorre se a tarefa pertencer ao usuário.
    """
    conn.execute(
        """
        UPDATE tasks
        SET titulo = ?, descricao = ?, status = ?
        WHERE id = ? AND user_id = ?
        """,
        (titulo, descricao, status, task_id, user_id)
    )
    conn.commit()


def delete_task(conn: sqlite3.Connection, task_id: int, user_id: int) -> None:
    """
    Exclui uma tarefa do banco de dados.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa a ser excluída
        user_id: ID do usuário (para verificar propriedade)

    Note:
        A exclusão só ocorre se a tarefa pertencer ao usuário.
    """
    conn.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id)
    )
    conn.commit()


def get_task_by_id(
    conn: sqlite3.Connection,
    task_id: int,
    user_id: int
) -> Optional[sqlite3.Row]:
    """
    Busca uma tarefa específica pelo ID.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa
        user_id: ID do usuário (para verificar propriedade)

    Returns:
        sqlite3.Row: Dados da tarefa se encontrada, None caso contrário
    """
    cursor = conn.execute(
        "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
        (task_id, user_id)
    )
    return cursor.fetchone()