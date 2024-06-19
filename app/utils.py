import hashlib
import os
import os.path as op
import logging
from fastapi import UploadFile, HTTPException
from os import path as op
from mimetypes import guess_type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from . import config as cfg

logger = logging.getLogger(__name__)


def enc_key(key: str) -> bytes:
    return hashlib.sha256(key.encode()).digest()


def enc_file(uf: UploadFile, file_path: str, key: str) -> str:
    encryption_key = enc_key(key)
    nonce = os.urandom(12)
    cipher = AESGCM(encryption_key)
    enc_path = file_path + cfg.EXT
    enc_dir = op.dirname(enc_path)

    # Ensure the directory exists
    if not op.exists(enc_dir):
        os.makedirs(enc_dir)

    try:
        with open(enc_path, 'wb') as enc_file:
            enc_file.write(nonce)
            while chunk := uf.file.read(cfg.CHUNK_SIZE):
                ciphertext = cipher.encrypt(nonce, chunk, None)
                chunk_size_bytes = len(ciphertext).to_bytes(4, byteorder='big')
                enc_file.write(chunk_size_bytes)
                enc_file.write(ciphertext)
        logger.info(f"File encrypted successfully: {enc_path}")
    except Exception as e:
        logger.error(f"Error encrypting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Error encrypting file")

    return enc_path


def stream_file(file_path: str, key: str):
    encryption_key = enc_key(key)

    try:
        with open(file_path, 'rb') as file:
            nonce = file.read(12)
            cipher = AESGCM(encryption_key)
            while True:
                chunk_size_bytes = file.read(4)
                if not chunk_size_bytes:
                    break
                chunk_size = int.from_bytes(chunk_size_bytes, byteorder='big')
                chunk = file.read(chunk_size)
                yield cipher.decrypt(nonce, chunk, None)
    except Exception as e:
        logger.error(f"Error decrypting file: {str(e)}")
        raise HTTPException(status_code=400, detail="Error decrypting file")


def sha_dir(key: str) -> str:
    name = hashlib.sha256(key.encode()).digest()[0:10].hex()
    dir_path = op.join(cfg.UPLOAD_DIR, name)
    if not op.exists(dir_path):
        os.makedirs(dir_path)
    return name


def memetype(filename: str) -> str:
    mime_type, _ = guess_type(filename, strict=False)
    if not mime_type:
        mime_type = "application/octet-stream"
    return mime_type


def strip_ext(name: str) -> str:
    return name[: -len(cfg.EXT)] if name.endswith(cfg.EXT) else name
