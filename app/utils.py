import hashlib
import os
import base58 as b58
from fastapi import UploadFile
from logfunc import logf
from os import path as op
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from . import config as cfg


def enc_key(key: str) -> bytes:
    return hashlib.sha256(key.encode()).digest()


def enc_file(file: UploadFile, file_path: str, key: str) -> str:
    encryption_key = enc_key(key)
    nonce = os.urandom(12)
    cipher = AESGCM(encryption_key)

    plaintext = file.file.read()

    ciphertext = cipher.encrypt(nonce, plaintext, None)

    enc_path = f"{file_path}.enc"
    with open(enc_path, 'wb') as enc_file:
        enc_file.write(nonce + ciphertext)

    return enc_path


def stream_file(file_path: str, key: str):
    encryption_key = enc_key(key)

    with open(file_path, 'rb') as file:
        nonce = file.read(12)
        cipher = AESGCM(encryption_key)
        while chunk := file.read(cfg.CHUNK_SIZE):
            yield cipher.decrypt(nonce, chunk, None)


def sha_dir(key: str) -> str:
    name = hashlib.sha256(key.encode()).digest()[0:10].hex()
    if not op.exists(op.join(cfg.UPLOAD_DIR, name)):
        os.makedirs(op.join(cfg.UPLOAD_DIR, name))
    return name
