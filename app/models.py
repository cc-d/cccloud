from sqlalchemy import Column, Integer, String, LargeBinary
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from . import config as cfg

Base = declarative_base()

engine = create_async_engine(cfg.DB_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


class File(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    path = Column(String)
    iv = Column(LargeBinary)
    user_id = Column(Integer)
