# app/Dockerfile
FROM python:3.11-slim

WORKDIR /app
RUN apt-get update -y
RUN apt-get install -yqq python3-venv && python3 -m venv venv

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .


ENV PATH="/app/venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/venv"
ENV PYTHONPATH="/:${PYTHONPATH}"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]