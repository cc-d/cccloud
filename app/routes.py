import os
import logging

import os.path as op
from hashlib import sha256
from pyshared import U, Opt, Gen
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, status
from fastapi.responses import StreamingResponse, Response
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from .appinit import app

from logfunc import logf
from . import config as cfg

from . import utils as ut


logr = logging.getLogger(__name__)

os.environ['LOGF_USE_PRINT'] = 'True'


@app.get('/')
def index():
    return {'status': 'ok'}


@app.put("/files/{uid}", status_code=status.HTTP_201_CREATED)
async def upload_file(uid: str, file: UploadFile = File(...)):
    fname = file.filename
    enc = ut.enc_file(
        file, op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(fname)), uid
    )

    return {
        'status': 'ok',
        'url': f'{cfg.BASE_URL}/files/{uid}/view/{fname}',
        'encrypted': enc,
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


@app.get("/files/{uid}", response_model=list[str])
async def list_files(uid: str):

    if not op.exists(op.join(cfg.UPLOAD_DIR, ut.b58enc(uid))):
        return []
    return [
        cfg.BASE_URL + f'/files/{uid}/view/{ut.b58dec(f)}'
        for f in os.listdir(op.join(cfg.UPLOAD_DIR, uid))
    ]


@app.get("/files/{uid}/view/{filename}", response_class=StreamingResponse)
async def view_file(uid: str, filename: str):
    mtype = ut.memetype(filename)

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(uid), ut.b58enc(filename))
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(ut.stream_file(file_path, uid), media_type=mtype)
