from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from . import models, schemas, depends

app = FastAPI()


@app.on_event("startup")
async def startup():
    await depends.database.connect()
    async with depends.engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)


@app.on_event("shutdown")
async def shutdown():
    await depends.database.disconnect()


@app.post("/files/", response_model=schemas.File)
async def create_file(
    file: schemas.FileCreate, db: AsyncSession = Depends(depends.get_db)
):
    db_file = models.File(**file.dict())
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)
    return db_file
