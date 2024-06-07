from pydantic import BaseModel


class FileBase(BaseModel):
    name: str
    user_id: int


class FileCreate(FileBase):
    pass


class File(FileBase):
    id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True
