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


@app.post("/upload/", status_code=status.HTTP_201_CREATED)
@app.post("/up", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...), key: str = Query(...)):
    ef = ut.enc_file(
        file, op.join(cfg.UPLOAD_DIR, ut.sha_dir(key), file.filename), key
    )

    return {"info": f"file '{file.filename}' saved and encrypted at '{ef}'"}


@app.get("/download/", response_class=StreamingResponse)
@app.get("/dl", response_class=StreamingResponse)
@logf(use_print=True)
async def download_file(filename: str, key: str = Query(...)):
    file_path = op.join(
        cfg.UPLOAD_DIR, ut.sha_dir(key), filename.rstrip(cfg.EXT) + cfg.EXT
    )
    print(f"download_file: file_path: {file_path}")

    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    response = StreamingResponse(
        ut.stream_file(file_path, key), media_type="application/octet-stream"
    )
    response.headers["Content-Disposition"] = (
        f"attachment; filename={filename}"
    )
    response.headers["Transfer-Encoding"] = "chunked"
    return response


def _guess_type(filename: str) -> str:
    mime_type, _ = guess_type(filename)
    if not mime_type:
        mime_type = "application/octet-stream"
    return mime_type


@app.get("/view/{filename}", response_class=StreamingResponse)
async def view_file(filename: str, key: str = Query(...)):
    file_path = op.join(
        cfg.UPLOAD_DIR, ut.sha_dir(key), filename.rstrip(cfg.EXT) + cfg.EXT
    )
    if not op.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return StreamingResponse(
        ut.stream_file(file_path, key), media_type=_guess_type(filename)
    )
