import re
import os
from hashlib import sha256
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


def sha_dir(key: str) -> str:
    name = sha256(key.encode()).digest()[0:10].hex()
    dir_path = op.join(cfg.UPLOAD_DIR, name)
    if not op.exists(dir_path):
        os.makedirs(dir_path)
    return name


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


class HashSecret:
    TYPES: tuple = ('b58', 'hex', 'bytes')
    _hex: str
    _b58: str
    _bytes: bytes
    _val: U[str, bytes]
    _sha256: bytes
    _dir: str

    def __init__(self, val: U[str, bytes], stype: f'{TYPES}' = 'b58'):
        self._val = val
        if isinstance(val, bytes) or stype == 'bytes':
            self._bytes = val
        elif isinstance(val, str):
            if stype == 'b58':
                self._bytes = b58.b58decode(val)
            elif stype == 'hex':
                self._bytes = bytes.fromhex(val)

    @property
    def hex(self) -> str:
        if not hasattr(self, '_hex'):
            self._hex = self._bytes.hex()
        return self._hex

    @property
    def b58(self) -> str:
        if not hasattr(self, '_b58'):
            self._b58 = b58.b58encode(self.bytes).decode()
        return self._b58

    @property
    def bytes(self) -> bytes:
        return self._bytes

    def sha256(self, fmt: str = 'b58') -> str:
        if not hasattr(self, '_sha256'):
            self._sha256 = sha256(self.bytes).digest()

        if fmt == 'b58':
            return b58.b58encode(self._sha256).decode()
        elif fmt == 'hex':
            return self._sha256.hex()

        return self._sha256

    @property
    def dir(self) -> str:
        if not hasattr(self, '_dir'):
            self._dir = b58enc(self.sha256(fmt='bytes')[16:32])
        return self._dir

    @property
    def secret(self) -> str:
        if not hasattr(self, '_secret'):
            self._secret = b58enc(self.sha256(fmt='bytes')[0:16])
        return self._secret

    def __str__(self) -> str:
        return self.b58

    def __bytes__(self) -> bytes:
        return self.bytes

    def create_dir(self, path: str) -> str:
        dir_path = op.join(self.dir, path)
        if not op.exists(dir_path):
            os.makedirs(dir_path)
        return op.abspath(dir_path)

    @logf(use_print=True)
    def write_enc(
        self, path: str, uf: Opt[UploadFile] = None, data: bytes = None
    ) -> str:
        path = self._abspath(path)
        if data is None and uf is None:
            raise ValueError("No data to write")
        if uf is None:
            return enc_data(data, path, self.secret)
        return enc_file(uf, path, self.secret)

    def read_enc(self, path: str) -> bytes:
        file_path = op.join(path, self.dir)
        return stream_file(file_path, self.secret)

    def list_files(self, path: str) -> list[str]:
        dir_path = op.join(path, self.dir)
        if not op.exists(dir_path):
            return []
        return [self.b58dec(f) for f in os.listdir(dir_path)]
