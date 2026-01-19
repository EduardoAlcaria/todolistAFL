import os
import secrets

ALGORITHM = "HS256"

# Gera uma SECRET_KEY segura se não estiver definida
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    secrets.token_urlsafe(32)  # Fallback seguro para desenvolvimento
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
