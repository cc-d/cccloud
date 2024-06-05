from pydantic import BaseModel

class FileBase(BaseModel):
    filename: str
    encrypted_filename: str
    user_id: int

class FileCreate(FileBase):
    pass

class File(FileBase):
    id: int

    @classmethod
    def from_orm(cls, model):
        return cls(
            id=model.id,
            filename=model.filename,
            encrypted_filename=model.encrypted_filename,
            user_id=model.user_id,
        )

