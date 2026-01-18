"""
TodoList API - Aplicação principal.

Este módulo inicializa a aplicação FastAPI com todas as rotas,
middlewares e configurações necessárias.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from api.routes.auth import router as auth_router
from api.routes.tasks import router as tasks_router
from api.routes.categories import router as categories_router
from db.init_db import init_db

import logging

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="TodoList API",
    description="API para gerenciamento de tarefas com autenticação JWT",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Inicializa o banco de dados
init_db()


# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Logger para a aplicação
logger = logging.getLogger("__name__")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response


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
app.include_router(categories_router, tags=["Categorias"])


@app.get("/", tags=["Health Check"])
def read_root():
    """
    Endpoint raiz para verificar se a API está funcionando.

    Returns:
        dict: Informações sobre a API
    """
    return {
        "message": "TodoList API está funcionando!",
        "version": "2.0.0",
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