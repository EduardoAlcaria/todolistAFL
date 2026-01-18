from fastapi import FastAPI
from api.routes.auth import router as auth_router
from db.init_db import init_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
init_db()

app.include_router(auth_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)