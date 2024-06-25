from fastapi import Depends, Header, Request, HTTPException


def get_secret(request: Request) -> str:
    if not request.query_params.get('secret'):
        if not request.headers.get('Authorization'):
            raise HTTPException(status_code=401, detail='Unauthorized')
        return request.headers.get('Authorization')
    return request.query_params.get('secret')
