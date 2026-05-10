from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes import auth, users, categories, expenses
from app.db.database import SessionLocal
from app.db.init_db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Personal Expense Tracker API",
    description="A simple expense tracking API built with FastAPI.",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(expenses.router)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": "personal-expense-tracker-api",
    }


@app.get("/health/db")
def database_health_check():
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected",
        }
    finally:
        db.close()