"""
Rotas de tarefas.

Este módulo contém os endpoints para criar, listar, atualizar
e excluir tarefas do usuário autenticado.
"""

from fastapi import APIRouter, Depends, HTTPException

from db.database import get_db
from api.deps import get_current_user
from models.tasks import TaskCreate, TaskUpdate
from repositories.tasks_repo import (
    get_tasks_by_user,
    create_task,
    update_task,
    delete_task,
    get_task_by_id
)


router = APIRouter()


@router.get("/tasks")
def get_tasks(user=Depends(get_current_user), conn=Depends(get_db)):
    """
    Lista todas as tarefas do usuário autenticado.

    Args:
        user: Usuário autenticado
        conn: Conexão com o banco de dados

    Returns:
        list: Lista de tarefas do usuário
    """
    tasks = get_tasks_by_user(conn, user["id"])
    return [dict(row) for row in tasks]


@router.post("/tasks")
def create_new_task(
    data: TaskCreate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """
    Cria uma nova tarefa para o usuário autenticado.

    Args:
        data: Dados da tarefa (título, descrição, status)
        user: Usuário autenticado
        conn: Conexão com o banco de dados

    Returns:
        dict: ID da tarefa criada e confirmação
    """
    task_id = create_task(
        conn,
        user["id"],
        data.titulo,
        data.descricao or "",
        data.status
    )
    return {
        "id": task_id,
        "ok": True
    }


@router.put("/tasks/{task_id}")
def update_existing_task(
    task_id: int,
    data: TaskUpdate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """
    Atualiza uma tarefa existente do usuário.

    Args:
        task_id: ID da tarefa a ser atualizada
        data: Novos dados da tarefa
        user: Usuário autenticado
        conn: Conexão com o banco de dados

    Returns:
        dict: Confirmação da atualização

    Raises:
        HTTPException: Se a tarefa não for encontrada
    """
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada"
        )

    # Usa valores existentes se novos não forem fornecidos
    new_titulo = data.titulo if data.titulo is not None else task["titulo"]
    new_descricao = (
        data.descricao if data.descricao is not None else task["descricao"]
    )
    new_status = data.status if data.status is not None else task["status"]

    update_task(
        conn,
        task_id,
        user["id"],
        new_titulo,
        new_descricao,
        new_status
    )
    return {"ok": True}


@router.delete("/tasks/{task_id}")
def delete_existing_task(
    task_id: int,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """
    Exclui uma tarefa do usuário.

    Args:
        task_id: ID da tarefa a ser excluída
        user: Usuário autenticado
        conn: Conexão com o banco de dados

    Returns:
        dict: Confirmação da exclusão

    Raises:
        HTTPException: Se a tarefa não for encontrada
    """
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(
            status_code=404,
            detail="Tarefa não encontrada"
        )

    delete_task(conn, task_id, user["id"])
    return {"ok": True}