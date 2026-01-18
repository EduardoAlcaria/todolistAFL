from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from core.config import SECRET_KEY, ALGORITHM
from db.database import get_db
from repositories.user_repo import get_user_by_email
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401)

    user = get_user_by_email(conn, email)
    if not user:
        raise HTTPException(status_code=401)
    return user
