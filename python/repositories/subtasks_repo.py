"""
Repositório de subtarefas.

Este módulo contém funções para acessar e manipular dados de subtarefas
no banco de dados.
"""

import sqlite3
from typing import List, Optional


def get_subtasks_by_task(
    conn: sqlite3.Connection,
    task_id: int
) -> List[sqlite3.Row]:
    """
    Busca todas as subtarefas de uma tarefa.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa

    Returns:
        List[sqlite3.Row]: Lista de subtarefas da tarefa
    """
    cursor = conn.execute(
        "SELECT * FROM subtasks WHERE task_id = ? ORDER BY ordem, id",
        (task_id,)
    )
    return cursor.fetchall()


def create_subtask(
    conn: sqlite3.Connection,
    task_id: int,
    titulo: str,
    concluida: bool = False
) -> int:
    """
    Cria uma nova subtarefa no banco de dados.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa pai
        titulo: Título da subtarefa
        concluida: Status de conclusão

    Returns:
        int: ID da subtarefa criada
    """
    # Busca a próxima ordem disponível
    cursor = conn.execute(
        "SELECT COALESCE(MAX(ordem), -1) + 1 FROM subtasks WHERE task_id = ?",
        (task_id,)
    )
    ordem = cursor.fetchone()[0]
    
    cursor = conn.execute(
        """
        INSERT INTO subtasks (task_id, titulo, concluida, ordem)
        VALUES (?, ?, ?, ?)
        """,
        (task_id, titulo, int(concluida), ordem)
    )
    conn.commit()
    return cursor.lastrowid


def update_subtask(
    conn: sqlite3.Connection,
    subtask_id: int,
    titulo: str,
    concluida: bool
) -> None:
    """
    Atualiza uma subtarefa existente.

    Args:
        conn: Conexão com o banco de dados
        subtask_id: ID da subtarefa a ser atualizada
        titulo: Novo título da subtarefa
        concluida: Novo status de conclusão
    """
    conn.execute(
        """
        UPDATE subtasks
        SET titulo = ?, concluida = ?
        WHERE id = ?
        """,
        (titulo, int(concluida), subtask_id)
    )
    conn.commit()


def delete_subtask(
    conn: sqlite3.Connection,
    subtask_id: int
) -> None:
    """
    Exclui uma subtarefa do banco de dados.

    Args:
        conn: Conexão com o banco de dados
        subtask_id: ID da subtarefa a ser excluída
    """
    conn.execute(
        "DELETE FROM subtasks WHERE id = ?",
        (subtask_id,)
    )
    conn.commit()


def get_subtask_by_id(
    conn: sqlite3.Connection,
    subtask_id: int
) -> Optional[sqlite3.Row]:
    """
    Busca uma subtarefa específica pelo ID.

    Args:
        conn: Conexão com o banco de dados
        subtask_id: ID da subtarefa

    Returns:
        sqlite3.Row: Dados da subtarefa se encontrada, None caso contrário
    """
    cursor = conn.execute(
        "SELECT * FROM subtasks WHERE id = ?",
        (subtask_id,)
    )
    return cursor.fetchone()