from fastapi import Depends, Request,  HTTPException`
from .utils import Secret, Token
from pyshared import Opt, U, Gen

def get_secret(
    request: Request
) -> Secret:
    r = request
    secret = r.headers.get('X-Secret') or r.query_params.get('secret') or r.headers.get('Authorization') or r.headers.get('X-Secret')