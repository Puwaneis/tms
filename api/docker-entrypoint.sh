#!/bin/sh
set -e
cd /app

attempt=0
max=40
while [ "$attempt" -lt "$max" ]; do
  if flask db upgrade; then
    break
  fi
  attempt=$((attempt + 1))
  echo "Waiting for database / migrations (attempt $attempt/$max)..."
  sleep 2
done

if [ "$attempt" -ge "$max" ]; then
  echo "flask db upgrade did not succeed after $max attempts"
  exit 1
fi

exec flask run --host=0.0.0.0 --port=5000 --no-reload
