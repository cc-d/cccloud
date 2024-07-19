from fastapi import Depends, Request, HTTPException
from .utils import Secret, Token


def get_secret(request: Request) -> Secret:
    token = request.query_params.get('token')
    secret = request.headers.get('X-Secret') or request.headers.get('Secret')
    if request.headers.get('Authorization'):
        secret = request.headers['Authorization']
    if token:
        return Secret(token=token)
    elif secret:
        return Secret(secret=secret)

    raise HTTPException(status_code=400, detail='Secret not provided')
