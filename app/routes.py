import os
import logging

import os.path as op
from hashlib import sha256
from pyshared import U, Opt, Gen
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, status
from fastapi.responses import StreamingResponse, Response
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from mimetypes import guess_type
from .appinit import app

from logfunc import logf
from . import config as cfg

from . import utils as ut


logr = logging.getLogger(__name__)

os.environ['LOGF_USE_PRINT'] = 'True'


@app.get('/')
def index():
    return {'status': 'ok'}


@app.post("/up/{uid}", status_code=status.HTTP_201_CREATED)
@logf(use_print=True)
async def upload_file(uid: str, file: UploadFile = File(...)):
    print(f'uid: {uid}, file: {file},')
    ef = ut.enc_file(
        file, op.join(cfg.UPLOAD_DIR, uid, _safename(file.filename)), uid
    )

    return {
        'status': 'ok',
        'url': f'{cfg.BASE_URL}/view/{uid}/{file.filename}',
    }


@app.get("/dl/{uid}/{filename}", response_class=StreamingResponse)
@logf(use_print=True)
async def download_file(uid: str, filename: str):
    file_path = op.join(
        cfg.UPLOAD_DIR, uid, filename.rstrip(cfg.EXT) + cfg.EXT
    )

    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    response = StreamingResponse(
        ut.stream_file(file_path, uid), media_type="application/octet-stream"
    )
    response.headers["Content-Disposition"] = (
        f"attachment; filename={filename}"
    )
    response.headers["Transfer-Encoding"] = "chunked"
    return response


def _guess_type(filename: str) -> str:
    mime_type, _ = guess_type(filename, strict=False)
    if not mime_type:
        mime_type = "application/octet-stream"
    return mime_type


def _safename(name: str) -> str:
    if name.endswith(cfg.EXT):
        name = name[: -len(cfg.EXT)]
    name = op.basename(name)
    name = ''.join([c for c in name if c.isalnum() or c in '._- '])
    return name


@app.get("/view/{uid}/{filename}", response_class=StreamingResponse)
@logf(use_print=True)
async def view_file(uid: str, filename: str):
    key = uid
    if filename.endswith(cfg.EXT):
        filename = filename[: -len(cfg.EXT)]
    file_path = op.join(cfg.UPLOAD_DIR, uid, _safename(filename) + cfg.EXT)
    print(f'file_path: {file_path}')
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(
        ut.stream_file(file_path, key), media_type=_guess_type(filename)
    )
