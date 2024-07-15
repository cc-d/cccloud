from pydantic import BaseModel
from pyshared import U, Opt, Gen
import base58 as b58


class ApiResp(BaseModel):
    status: str


class UploadFiles(ApiResp):
    url: str
    encrypted: str


class File(BaseModel):
    url: str
    relpath: str
    fs: str


class ListFiles(BaseModel):
    files: list[File]


class cccBaseSecret(BaseModel):
    secret: str
    enc: str
    fs: str


class BaseToken(BaseModel):
    token: str
