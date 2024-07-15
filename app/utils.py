import re
import os
from hashlib import sha256
import hmac
import os.path as op
import logging
import base58 as b58
from fastapi import UploadFile, HTTPException
from os import path as op
from mimetypes import guess_type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from pyshared import U, Opt, Gen
from functools import lru_cache as lru
import app.config as cfg


logger = logging.getLogger(__name__)


def enc_key(key: str) -> bytes:
    return sha256(key.encode()).digest()


def enc_data(b: U[str, bytes], path: str, key: str) -> str:
    if isinstance(b, str):
        b = b.encode()

    encryption_key = enc_key(key)
    nonce = os.urandom(12)
    cipher = AESGCM(encryption_key)

    with open(path, 'wb') as enc_file:
        enc_file.write(nonce)
        ciphertext = cipher.encrypt(nonce, b, None)
        enc_file.write(ciphertext)
    return path


def dec_data(path: str, key: str) -> bytes:
    encryption_key = enc_key(key)

    with open(path, 'rb') as file:
        nonce = file.read(12)
        cipher = AESGCM(encryption_key)
        ciphertext = file.read()
        return cipher.decrypt(nonce, ciphertext, None)


def enc_file(
    uf: UploadFile, file_path: str, key: str, http: bool = False
) -> str:

    encryption_key = enc_key(key)
    nonce = os.urandom(12)
    cipher = AESGCM(encryption_key)

    enc_dir = op.dirname(file_path)

    # Ensure the directory exists
    if not op.exists(enc_dir):
        os.makedirs(enc_dir)

    try:
        with open(file_path, 'wb') as enc_file:
            enc_file.write(nonce)
            while chunk := uf.file.read(cfg.CHUNK_SIZE):
                ciphertext = cipher.encrypt(nonce, chunk, None)
                chunk_size_bytes = len(ciphertext).to_bytes(4, byteorder='big')
                enc_file.write(chunk_size_bytes)
                enc_file.write(ciphertext)
        logger.info(f"File encrypted successfully: {file_path}")
    except Exception as e:
        logger.error(f"Error encrypting file: {str(e)}")
        if http:

            raise HTTPException(
                status_code=500, detail="Error encrypting file"
            )
        raise ValueError("Error encrypting file")
    return file_path


def stream_file(file_path: str, key: str, http: bool = False) -> Gen:
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
        if http:
            raise HTTPException(
                status_code=400, detail="Error decrypting file"
            )
        raise ValueError(f'Error decrypting file: {str(e)}')


def memetype(filename: str) -> str:
    mime_type, _ = guess_type(filename, strict=False)
    if not mime_type:
        mime_type = "application/octet-stream"
    return mime_type


def b58enc(s: U[str, bytes]) -> str:
    if hasattr(s, 'encode'):
        return b58.b58encode(s.encode()).decode()

    return b58.b58encode(s).decode()


def b58dec(s: U[str, bytes]) -> str:
    if hasattr(s, 'encode'):
        return b58.b58decode(s.encode()).decode()
    return b58.b58decode(s).decode()


def safe_name(s: str) -> str:
    return ''.join([c for c in s if c in op.basename(cfg.SAFE_CHARS)])


def gen_token(secret: str) -> str:
    return sha256(secret.encode()).hexdigest()


class Token:
    token: str

    def __init__(self, secret: Opt[str] = None, token: Opt[str] = None):
        if not any([secret, token]):
            raise ValueError('Either secret or token must be provided')
        if secret:
            self.token = (
                sha256(secret.encode()) if isinstance(secret, str) else secret
            )
            self.hex = (
                self.token.hexdigest()
                if not isinstance(secret, str)
                else secret.encode().hex()
            )

    def verify(self, token: Opt[str] = None, secret: Opt[str] = None) -> bool:
        if not any([token, secret]):
            raise ValueError('Either token or secret must be provided')
        if secret:
            expected_token = sha256(secret.encode()).hexdigest()
            return hmac.compare_digest(
                expected_token.encode(), self.token.encode()
            )
        return hmac.compare_digest(self.token.encode(), token.encode())

    @property
    def enc(self) -> str:
        if isinstance(self.token, str):
            return self.token.encode().hex()
        return str(self.token)

    @property
    def fs_fmt(self, fmt: str = 'bytes') -> str:
        if fmt == 'bytes':
            return self.token_hex.encode()
        elif fmt == 'hex':
            return self.token_hex
        return self.token_hex.encode()

    @property
    def fs(self) -> str:
        if not op.exists(op.join(cfg.UPLOAD_DIR, self.enc)):
            os.makedirs(op.join(cfg.UPLOAD_DIR, self.enc))
        return self.enc

    def write_file(self, file: UploadFile) -> str:
        return enc_file(
            file,
            op.join(
                cfg.UPLOAD_DIR,
                self.fs,
                file.filename.encode().hex(),
                key=self.token,
            ),
        )


class Secret:
    secret: str

    def __init__(self, secret: str):
        self.secret = secret

    @property
    def hex(self) -> str:
        b = (
            self.secret.encode()
            if isinstance(self.secret, str)
            else self.secret
        )
        return b.hex() if isinstance(b, bytes) else b.hex

    @property
    def token(self) -> Token:
        return Token(
            secret=(
                self.secret
                if isinstance(self.secret, str)
                else self.secret.hex
            )
        )

    def verify(self, token: str) -> bool:
        return self.token.verify(token=token)

    @property
    def enc(self) -> str:
        return self.token.enc

    @property
    def fs(self) -> str:
        return self.token.fs

    @property
    def fspath(self) -> str:
        return op.join(cfg.UPLOAD_DIR, self.fs)

    def __str__(self) -> str:
        return self.secret.encode().hex()

    def __repr__(self) -> str:
        return self.secret.encode().hex()


class EFile:
    def __init__(self, file: UploadFile, secret: str):
        self.file = file
        self.secret = secret

    def enc(self) -> str:
        return enc_file(self.file, self.secret)
