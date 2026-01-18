from fastapi import APIRouter, Depends, HTTPException
from db.database import get_db
from api.deps import get_current_user
from models.tasks import TaskCreate, TaskUpdate
from repositories.tasks_repo import get_tasks_by_user, create_task, update_task, delete_task, get_task_by_id

router = APIRouter()

@router.get("/tasks")
def get_tasks(user=Depends(get_current_user), conn=Depends(get_db)):
    tasks = get_tasks_by_user(conn, user["id"])
    return [dict(row) for row in tasks]

@router.post("/tasks")
def create_new_task(data: TaskCreate, user=Depends(get_current_user), conn=Depends(get_db)):
    task_id = create_task(
        conn, 
        user["id"], 
        data.titulo, 
        data.descricao or "", 
        data.status
    )
    return {"id": task_id, "ok": True}

@router.put("/tasks/{task_id}")
def update_existing_task(task_id: int, data: TaskUpdate, user=Depends(get_current_user), conn=Depends(get_db)):
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(404, "Task not found")
    
    update_task(
        conn,
        task_id,
        user["id"],
        data.titulo if data.titulo is not None else task["titulo"],
        data.descricao if data.descricao is not None else task["descricao"],
        data.status if data.status is not None else task["status"]
    )
    return {"ok": True}

@router.delete("/tasks/{task_id}")
def delete_existing_task(task_id: int, user=Depends(get_current_user), conn=Depends(get_db)):
    task = get_task_by_id(conn, task_id, user["id"])
    if not task:
        raise HTTPException(404, "Task not found")
    
    delete_task(conn, task_id, user["id"])
    return {"ok": True}