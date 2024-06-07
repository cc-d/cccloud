from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select

# from passlib.context import CryptContext alternative
# that doesnt work

from .appinit import app, pwd_context
from .depends import get_db


from . import schemas, models, depends


@app.get("/", tags=["Health Check"])
async def index():
    return {"status": "OK"}


Depdb = Depends(depends.get_db)


@app.post("/files/", response_model=schemas.File, tags=["Files"])
async def create_file(file: schemas.FileCreate, db: AsyncSession = Depdb):
    db_file = models.File(**file.model_dump())
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file


@app.post("/users/", response_model=schemas.User, tags=["Users"])
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depdb):
    hpass = pwd_context.hash(user.password)
    db_user = models.User(name=user.name, hpass=hpass)

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@app.post("/login/", tags=["Users"])
async def login(user: schemas.UserCreate, db: AsyncSession = Depdb):
    db_user = await db.execute(
        select(models.User).where(models.User.name == user.name)
    )
    db_user = db_user.scalar_one_or_none()
    if db_user is None or not pwd_context.verify(user.password, db_user.hpass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # return oauth2_token
    return {"access_token": db_user.name, "token_type": "bearer"}
