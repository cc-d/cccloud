from fastapi import FastAPI
from contextlib import asynccontextmanager
from passlib.context import CryptContext


app = FastAPI(
    title="Encrypted File Storage API",
    version="1.0",
    description="API for secure file storage with encryption and compression",
    docs_url="/docs",
    redoc_url="/redoc",
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
