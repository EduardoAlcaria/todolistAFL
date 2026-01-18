"""
Rotas de tarefas.

Este módulo contém os endpoints para criar, listar, atualizar
e excluir tarefas do usuário autenticado.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from datetime import date

from db.database import get_db
from api.deps import get_current_user
from models.tasks import TaskCreate, TaskUpdate, SubtaskCreate, SubtaskUpdate
from repositories.tasks_repo import (
    get_tasks_by_user,
    create_task,
    update_task,
    delete_task,
    get_task_by_id
)
from repositories.subtasks_repo import (
    get_subtasks_by_task,
    create_subtask,
    update_subtask,
    delete_subtask,
    get_subtask_by_id
)


router = APIRouter()


@router.get("/tasks")
def get_tasks(
    user=Depends(get_current_user),
    conn=Depends(get_db),
    categoria_id: Optional[int] = Query(None),
    data_inicio: Optional[date] = Query(None),
    data_fim: Optional[date] = Query(None)
):
    """Lista todas as tarefas do usuário autenticado com filtros opcionais."""
    tasks = get_tasks_by_user(
        conn,
        user["id"],
        categoria_id,
        data_inicio,
        data_fim
    )
    
    # Adiciona subtarefas para cada tarefa
    result = []
    for task in tasks:
        task_dict = dict(task)
        subtasks = get_subtasks_by_task(conn, task["id"])
        task_dict["subtasks"] = [dict(s) for s in subtasks]
        result.append(task_dict)
    
    return result


@router.post("/tasks")
def create_new_task(
    data: TaskCreate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
): 

    """Cria uma nova tarefa para o usuário autenticado."""
    task_id = create_task(
        conn,
        user["id"],
        data.titulo,
        data.descricao or "",
        data.status,
        data.categoria_id,
        data.data_vencimento
    )
    return {"id": task_id, "ok": True}


@router.put("/tasks/{task_id}")
def update_existing_task(
    task_id: int,
    data: TaskUpdate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Atualiza uma tarefa existente do usuário."""
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    new_titulo = data.titulo if data.titulo is not None else task["titulo"]
    new_descricao = (
        data.descricao if data.descricao is not None else task["descricao"]
    )
    new_status = data.status if data.status is not None else task["status"]
    new_categoria_id = (
        data.categoria_id if data.categoria_id is not None 
        else task["categoria_id"]
    )
    new_data_vencimento = (
        data.data_vencimento if data.data_vencimento is not None 
        else task["data_vencimento"]
    )

    update_task(
        conn,
        task_id,
        user["id"],
        new_titulo,
        new_descricao,
        new_status,
        new_categoria_id,
        new_data_vencimento
    )
    return {"ok": True}


@router.delete("/tasks/{task_id}")
def delete_existing_task(
    task_id: int,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Exclui uma tarefa do usuário."""
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    delete_task(conn, task_id, user["id"])
    return {"ok": True}


# Rotas de subtarefas


@router.post("/tasks/{task_id}/subtasks")
def create_new_subtask(
    task_id: int,
    data: SubtaskCreate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Cria uma nova subtarefa para uma tarefa."""
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    subtask_id = create_subtask(
        conn,
        task_id,
        data.titulo,
        data.concluida
    )
    return {"id": subtask_id, "ok": True}


@router.put("/subtasks/{subtask_id}")
def update_existing_subtask(
    subtask_id: int,
    data: SubtaskUpdate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Atualiza uma subtarefa existente."""
    subtask = get_subtask_by_id(conn, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtarefa não encontrada")

    new_titulo = (
        data.titulo if data.titulo is not None else subtask["titulo"]
    )
    new_concluida = (
        data.concluida if data.concluida is not None else subtask["concluida"]
    )

    update_subtask(conn, subtask_id, new_titulo, new_concluida)
    return {"ok": True}


@router.delete("/subtasks/{subtask_id}")
def delete_existing_subtask(
    subtask_id: int,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Exclui uma subtarefa."""
    subtask = get_subtask_by_id(conn, subtask_id)
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtarefa não encontrada")

    delete_subtask(conn, subtask_id)
    return {"ok": True}