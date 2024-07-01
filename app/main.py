from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import app

origins = [
    "http://localhost:3000",
    "http://localhost:80",
    "http://localhost",
    "http://localhost:8000",
    "https://cloud.cc-d.me",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
