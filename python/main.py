"""
TodoList API - Aplicação principal.

Este módulo inicializa a aplicação FastAPI com todas as rotas,
middlewares e configurações necessárias.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.auth import router as auth_router
from api.routes.tasks import router as tasks_router
from db.init_db import init_db


# Inicializa a aplicação FastAPI
app = FastAPI(
    title="TodoList API",
    description="API para gerenciamento de tarefas com autenticação JWT",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Inicializa o banco de dados
init_db()

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(auth_router, tags=["Autenticação"])
app.include_router(tasks_router, tags=["Tarefas"])


@app.get("/", tags=["Health Check"])
def read_root():
    """
    Endpoint raiz para verificar se a API está funcionando.

    Returns:
        dict: Informações sobre a API
    """
    return {
        "message": "TodoList API está funcionando!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health Check"])
def health_check():
    """
    Endpoint de health check para monitoramento.

    Returns:
        dict: Status da aplicação
    """
    return {"status": "healthy"}