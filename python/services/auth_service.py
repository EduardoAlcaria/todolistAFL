from repositories.user_repo import get_user_by_email, create_user
from core.security import hash_password, verify_password

def register(conn, email: str, password: str):
    if get_user_by_email(conn, email):
        return False
    print(f"Registering user: {email}")
    print(f"Password: {password}")
    create_user(conn, email, hash_password(password))
    return True

def authenticate(conn, email: str, password: str):
    print(f"Authenticating user: {email}")
    print(f"Password: {password}")
    user = get_user_by_email(conn, email)
    if not user:
        return None
    if not verify_password(password, user["password_hash"]):
        return None
    return user
