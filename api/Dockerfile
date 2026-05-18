FROM python:3.12-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY api/ /app/

RUN chmod +x /app/docker-entrypoint.sh

ENV FLASK_APP=app.py

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
