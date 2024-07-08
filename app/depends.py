from fastapi import Depends, Header, Request, HTTPException
from .schema import cccSecret
from .utils import HashStr

def get_secret(request: Request) ->
    if not request.query_params.get('secret'):
        if not request.headers.get('Authorization'):
            raise HTTPException(status_code=401, detail='Unauthorized')
        return request.headers.get('Authorization')
    return request.query_params.get('secret')


