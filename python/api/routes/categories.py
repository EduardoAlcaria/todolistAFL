"""
Rotas de categorias.

Este módulo contém os endpoints para gerenciar categorias de tarefas.
"""

from fastapi import APIRouter, Depends, HTTPException

from db.database import get_db
from api.deps import get_current_user
from models.tasks import CategoryCreate, CategoryUpdate
from repositories.categories_repo import (
    get_categories_by_user,
    create_category,
    update_category,
    delete_category,
    get_category_by_id
)


router = APIRouter()


@router.get("/categories")
def get_categories(user=Depends(get_current_user), conn=Depends(get_db)):
    """Lista todas as categorias do usuário autenticado."""
    categories = get_categories_by_user(conn, user["id"])
    return [dict(row) for row in categories]


@router.post("/categories")
def create_new_category(
    data: CategoryCreate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Cria uma nova categoria para o usuário autenticado."""
    category_id = create_category(
        conn,
        user["id"],
        data.nome,
        data.cor
    )
    return {"id": category_id, "ok": True}


@router.put("/categories/{category_id}")
def update_existing_category(
    category_id: int,
    data: CategoryUpdate,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Atualiza uma categoria existente do usuário."""
    category = get_category_by_id(conn, category_id, user["id"])
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    new_nome = data.nome if data.nome is not None else category["nome"]
    new_cor = data.cor if data.cor is not None else category["cor"]

    update_category(conn, category_id, user["id"], new_nome, new_cor)
    return {"ok": True}


@router.delete("/categories/{category_id}")
def delete_existing_category(
    category_id: int,
    user=Depends(get_current_user),
    conn=Depends(get_db)
):
    """Exclui uma categoria do usuário."""
    category = get_category_by_id(conn, category_id, user["id"])
    if not category:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")

    delete_category(conn, category_id, user["id"])
    return {"ok": True}