from pydantic import BaseModel


class ApiResp(BaseModel):
    status: str


class UploadFiles(ApiResp):
    url: str
    encrypted: str


class File(BaseModel):
    url: str
    fs: str


class ListFiles(BaseModel):
    files: list[File]
