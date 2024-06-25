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
    "/files/{cccid}",
    status_code=status.HTTP_201_CREATED,
    response_model=sch.File,
)
async def upload_file(
    cccid: str, file: UploadFile = File(...), secret: str = Depends(get_secret)
):

    fname = file.filename
    enc = ut.enc_file(
        file,
        op.join(cfg.UPLOAD_DIR, ut.b58enc(cccid), ut.b58enc(fname)),
        secret,
    )

    return {
        'relpath': fname,
        'url': f'{cfg.BASE_URL}/files/{cccid}/view/{fname}',
        'fs': ut.b58enc(fname),
    }


@app.get("/files/{cccid}/dl/{filename}", response_class=StreamingResponse)
async def download_file(
    cccid: str, filename: str, secret: str = Depends(get_secret)
):

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(cccid), ut.b58enc(filename))

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


@app.get("/files/{cccid}", response_model=list[sch.File])
async def list_files(cccid: str):
    enccccid = ut.b58enc(cccid)

    if not op.exists(op.join(cfg.UPLOAD_DIR, enccccid)):
        return []

    return [
        sch.File(
            url=f"{cfg.BASE_URL}/files/{cccid}/view/{ut.b58dec(f)}",
            fs=f,
            relpath=ut.b58dec(f),
        )
        for f in os.listdir(op.join(cfg.UPLOAD_DIR, enccccid))
    ]


@app.get("/files/{cccid}/view/{filename}", response_class=StreamingResponse)
async def view_file(
    cccid: str, filename: str, secret: str = Depends(get_secret)
):
    mtype = ut.memetype(filename)

    file_path = op.join(cfg.UPLOAD_DIR, ut.b58enc(cccid), ut.b58enc(filename))
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return StreamingResponse(
        ut.stream_file(file_path, secret), media_type=mtype
    )
