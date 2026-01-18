"""
Repositório de tarefas.

Este módulo contém funções para acessar e manipular dados de tarefas
no banco de dados.
"""

import sqlite3
from typing import List, Optional
from datetime import date


def get_tasks_by_user(
    conn: sqlite3.Connection,
    user_id: int,
    categoria_id: Optional[int] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None
) -> List[sqlite3.Row]:
    """
    Busca todas as tarefas de um usuário com filtros opcionais.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário
        categoria_id: Filtro opcional por categoria
        data_inicio: Filtro opcional de data inicial
        data_fim: Filtro opcional de data final

    Returns:
        List[sqlite3.Row]: Lista de tarefas do usuário
    """
    query = """
        SELECT t.*, c.nome as categoria_nome, c.cor as categoria_cor
        FROM tasks t
        LEFT JOIN categories c ON t.categoria_id = c.id
        WHERE t.user_id = ?
    """
    params = [user_id]
    
    if categoria_id is not None:
        query += " AND t.categoria_id = ?"
        params.append(categoria_id)
    
    if data_inicio is not None:
        query += " AND t.data_vencimento >= ?"
        params.append(data_inicio)
    
    if data_fim is not None:
        query += " AND t.data_vencimento <= ?"
        params.append(data_fim)
    
    query += " ORDER BY t.data_criacao DESC"
    
    cursor = conn.execute(query, tuple(params))
    return cursor.fetchall()


def create_task(
    conn: sqlite3.Connection,
    user_id: int,
    titulo: str,
    descricao: str,
    status: str,
    categoria_id: Optional[int] = None,
    data_vencimento: Optional[date] = None
) -> int:
    """
    Cria uma nova tarefa no banco de dados.

    Args:
        conn: Conexão com o banco de dados
        user_id: ID do usuário proprietário da tarefa
        titulo: Título da tarefa
        descricao: Descrição da tarefa
        status: Status da tarefa
        categoria_id: ID da categoria (opcional)
        data_vencimento: Data de vencimento (opcional)

    Returns:
        int: ID da tarefa criada
    """
    cursor = conn.execute(
        """
        INSERT INTO tasks 
        (user_id, categoria_id, titulo, descricao, status, data_vencimento)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, categoria_id, titulo, descricao, status, data_vencimento)
    )
    conn.commit()
    return cursor.lastrowid


def update_task(
    conn: sqlite3.Connection,
    task_id: int,
    user_id: int,
    titulo: str,
    descricao: str,
    status: str,
    categoria_id: Optional[int] = None,
    data_vencimento: Optional[date] = None
) -> None:
    """
    Atualiza uma tarefa existente.

    Args:
        conn: Conexão com o banco de dados
        task_id: ID da tarefa a ser atualizada
        user_id: ID do usuário
        titulo: Novo título da tarefa
        descricao: Nova descrição da tarefa
        status: Novo status da tarefa
        categoria_id: Nova categoria (opcional)
        data_vencimento: Nova data de vencimento (opcional)
    """
    conn.execute(
        """
        UPDATE tasks
        SET titulo = ?, descricao = ?, status = ?, 
            categoria_id = ?, data_vencimento = ?
        WHERE id = ? AND user_id = ?
        """,
        (titulo, descricao, status, categoria_id, data_vencimento, task_id, user_id)
    )
    conn.commit()


def delete_task(conn: sqlite3.Connection, task_id: int, user_id: int) -> None:
    """Exclui uma tarefa do banco de dados."""
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
    """Busca uma tarefa específica pelo ID."""
    cursor = conn.execute(
        """
        SELECT t.*, c.nome as categoria_nome, c.cor as categoria_cor
        FROM tasks t
        LEFT JOIN categories c ON t.categoria_id = c.id
        WHERE t.id = ? AND t.user_id = ?
        """,
        (task_id, user_id)
    )
    return cursor.fetchone()