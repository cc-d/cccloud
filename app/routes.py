import os
import logging

import os.path as op
from hashlib import sha256
from pyshared import U, Opt, Gen
from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Query,
    status,
    Header,
    Depends,
    Body,
)
from fastapi.responses import StreamingResponse, Response, PlainTextResponse
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .appinit import app

from logfunc import logf
from . import config as cfg
from . import schema as sch
from . import utils as ut
from .depends import get_secret


logr = logging.getLogger(__name__)

os.environ['LOGF_USE_PRINT'] = 'True'


@app.get('/')
def index():
    return {'status': 'ok'}


@app.put(
    "/files",
    status_code=status.HTTP_201_CREATED,
    response_model=list[sch.File],
)
async def upload_files(
    file: UploadFile = File(...), secret: str = Depends(get_secret)
):

    files = []
    secret = ut.Secret(secret)
    sechex = secret.hex
    if not op.exists(op.join(cfg.UPLOAD_DIR, sechex)):
        os.makedirs(op.join(cfg.UPLOAD_DIR, sechex), exist_ok=True)
    f = file.filename.encode().hex()

    enc_file = ut.enc_file(
        file, op.join(cfg.UPLOAD_DIR, secret.fs, f), secret.enc
    )
    return [
        {
            'relpath': f,
            'url': f'{cfg.BASE_URL}/files/{secret.fs.encode().hex()}/view/{f.hexdigest() if isinstance(f, bytes) else f}',
            'fs': ut.b58enc(f),
            'name': f,
        }
    ]


@app.get("/files", response_model=list[dict])
async def list_files(secret: str = Depends(get_secret)):
    lfdir = op.join(cfg.UPLOAD_DIR, secret.token.fs)
    if secret is None:
        raise HTTPException(
            status_code=400,
            detail='Either body or query param secret must be provided',
        )

    files = []
    for f in os.listdir(lfdir):
        files.append(
            {
                'relpath': f,
                'url': f'{cfg.BASE_URL}/files/{secret.hex}/view/{f.hexdigest() if isinstance(f, bytes) else f}',
                'fs': op.abspath(op.join(lfdir, f)),
                'name': bytes.fromhex(f).decode().encode(),
            }
        )

    return files


@app.get("/files/{uid}/dl/{filename}", response_class=StreamingResponse)
async def download_file(
    uid: str, filename: str, secret: str = Depends(get_secret)
):

    file_path = op.join(
        cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(filename), True
    )

    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(
        ut.stream_file(file_path, secret),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Transfer-Encoding": "chunked",
        },
    )


@app.get("/files", response_model=list[sch.File])
async def list_files(secret: str = Depends(get_secret)):
    fs = op.join(cfg.UPLOAD_DIR, secret.fs)

    files = []
    return [
        {
            'relpath': f,
            'url': f"{cfg.BASE_URL}/files/{secret.fs}/view/{bytes.fromhex(f).decode()}",
            'fs': f"{secret.fs}/{f}",
            'name': f,
        }
        for f in os.listdir(op.join(cfg.UPLOAD_DIR, secret.fs))
    ]


@app.get("/files/{uid}/view/{filename}", response_class=StreamingResponse)
async def view_file(
    uid: str, filename: str, secret: str = Depends(get_secret)
):
    # assume hex format if matching criteria
    if filename.find('.') == -1 and set(filename.lower()) == {
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
    }:
        filename = bytes.fromhex(filename).decode()

    mtype = ut.memetype(filename)

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(filename))
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(
        ut.stream_file(file_path, secret), media_type=mtype
    )


@app.get('/token', response_class=PlainTextResponse)
async def token(secret: str = Depends(get_secret)):
    return ut.Token(secret).token


@app.post('/token', response_class=PlainTextResponse)
async def post_token(secret: ut.Secret = Depends(get_secret)):
    if not secret:
        raise HTTPException(
            status_code=400,
            detail='Either body or query param secret must be provided',
        )
    return secret.token.token


@app.post('/token/verify/{token}', response_class=PlainTextResponse)
async def verify_token(token: str, secret: str = Body(...)):
    if ut.Token(token=token).verify(secret):
        return 'ok'
    raise HTTPException(status_code=401, detail='Unauthorized')
