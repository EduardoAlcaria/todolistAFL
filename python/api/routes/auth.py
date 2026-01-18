from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from db.database import get_db
from services.auth_service import register, authenticate
from core.security import create_access_token
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from api.deps import get_current_user
from models.user import UserCreate

router = APIRouter()

@router.post("/register")
def register_user(data : UserCreate, conn=Depends(get_db)):
    if not register(conn, data.email, data.password):
        raise HTTPException(400, "User exists")
    return {"ok": True}

@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), conn=Depends(get_db)):
    user = authenticate(conn, form.username, form.password)
    if not user:
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token(
        {"sub": user["email"]},
        ACCESS_TOKEN_EXPIRE_MINUTES
    )
    print("Generated Token:", token)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def me(user=Depends(get_current_user)):
    return {"id": user["id"], "email": user["email"]}
