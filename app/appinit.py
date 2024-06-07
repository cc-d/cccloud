from fastapi import FastAPI, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from passlib.context import CryptContext
from . import schemas, models, depends


@asynccontextmanager
async def lifespan(app: FastAPI):
    await depends.database.connect()
    async with depends.engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    yield
    await depends.database.disconnect()


app = FastAPI(
    title="Encrypted File Storage API",
    version="1.0",
    description="API for secure file storage with encryption and compression",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    lifespan=lifespan,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
