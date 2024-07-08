from pydantic import BaseModel
from pyshared import U, Opt, Gen
import base58 as b58
from .utils import HashStr


class ApiResp(BaseModel):
    status: str


class UploadFiles(ApiResp):
    url: str
    encrypted: str


class File(BaseModel):
    url: str
    fs: str
    relpath: str


class ListFiles(BaseModel):
    files: list[File]


class cccBaseSecret(BaseModel):
    secret: str
    enc: str
    fs: str


class cccSecret(cccBaseSecret):
    secret: str
