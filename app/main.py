import sys
import os.path as op

sys.path.insert(0, op.dirname(op.dirname(op.abspath(__file__))))


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import app

origins = ["http://localhost:3000"]  # Add your frontend URL here

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
