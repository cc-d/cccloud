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
)
from fastapi.responses import StreamingResponse, Response
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
    "/files/{uid}",
    status_code=status.HTTP_201_CREATED,
    response_model=sch.File,
)
async def upload_file(uid: str, file: UploadFile = File(...)):

    fname = file.filename
    enc = ut.enc_file(
        file, op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(fname)), uid
    )

    return {
        'relpath': fname,
        'url': f'{cfg.BASE_URL}/files/{uid}/view/{fname}',
        'fs': ut.b58enc(fname),
    }


@app.get("/files/{uid}/dl/{filename}", response_class=StreamingResponse)
async def download_file(uid: str, filename: str):

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(filename))

    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(
        ut.stream_file(file_path, uid),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Transfer-Encoding": "chunked",
        },
    )


@app.get("/files/{uid}", response_model=list[sch.File])
async def list_files(uid: str):
    encuid = ut.b58enc(uid)

    if not op.exists(op.join(cfg.UPLOAD_DIR, encuid)):
        return []

    return [
        sch.File(
            url=f"{cfg.BASE_URL}/files/{uid}/view/{ut.b58dec(f)}",
            fs=f,
            relpath=ut.b58dec(f),
        )
        for f in os.listdir(op.join(cfg.UPLOAD_DIR, encuid))
    ]


@app.get("/files/{uid}/view/{filename}", response_class=StreamingResponse)
async def view_file(uid: str, filename: str):
    mtype = ut.memetype(filename)

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(filename))
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(ut.stream_file(file_path, uid), media_type=mtype)
