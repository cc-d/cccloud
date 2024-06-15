import os
import hashlib
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, status
from fastapi.responses import StreamingResponse, Response
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from mimetypes import guess_type
from .appinit import app
from .config import UPLOAD_DIR

CHUNK_SIZE = 1024 * 1024  # 1MB chunks


def derive_encryption_key(key: str) -> bytes:
    return hashlib.sha256(key.encode()).digest()


def encrypt_file(file_path: str, key: str):
    encryption_key = derive_encryption_key(key)
    nonce = os.urandom(12)
    cipher = AESGCM(encryption_key)

    with open(file_path, 'rb') as file:
        plaintext = file.read()

    ciphertext = cipher.encrypt(nonce, plaintext, None)

    encrypted_file_path = f"{file_path}.enc"
    with open(encrypted_file_path, 'wb') as enc_file:
        enc_file.write(nonce + ciphertext)

    return encrypted_file_path


def decrypt_file(file_path: str, key: str):
    encryption_key = derive_encryption_key(key)

    with open(file_path, 'rb') as enc_file:
        nonce = enc_file.read(12)
        ciphertext = enc_file.read()

    cipher = AESGCM(encryption_key)
    plaintext = cipher.decrypt(nonce, ciphertext, None)

    return plaintext


def stream_file(file_path: str, key: str):
    encryption_key = derive_encryption_key(key)

    with open(file_path, 'rb') as file:
        nonce = file.read(12)
        cipher = AESGCM(encryption_key)
        while chunk := file.read(CHUNK_SIZE):
            yield cipher.decrypt(nonce, chunk, None)


@app.post("/upload/", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...), key: str = Query(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb") as f:
        f.write(await file.read())

    encrypted_file_path = encrypt_file(file_location, key)

    return {
        "info": f"file '{file.filename}' saved and encrypted at '{encrypted_file_path}'"
    }


@app.get("/download/", response_class=StreamingResponse)
async def download_file(filename: str, key: str = Query(...)):
    file_path = os.path.join(UPLOAD_DIR, filename + ".enc")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    response = StreamingResponse(
        stream_file(file_path, key), media_type="application/octet-stream"
    )
    response.headers["Content-Disposition"] = (
        f"attachment; filename={filename}"
    )
    response.headers["Transfer-Encoding"] = "chunked"
    return response


@app.get("/view/{filename}")
async def view_file(filename: str, key: str = Query(...)):
    file_path = os.path.join(UPLOAD_DIR, filename + ".enc")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    decrypted_content = decrypt_file(file_path, key)

    mime_type, _ = guess_type(filename)
    if not mime_type:
        mime_type = "application/octet-stream"

    return Response(content=decrypted_content, media_type=mime_type)
