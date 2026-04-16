FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
COPY backend/ ./backend/

RUN cd frontend && npm run build

RUN pip install --no-cache-dir -r backend/requirements.txt

WORKDIR /app/backend

RUN python manage.py collectstatic --noinput

EXPOSE 8080
CMD python manage.py migrate --noinput && (python manage.py seed_data --file data/fund_data.xlsx || true) && gunicorn pe_platform.wsgi --workers 2 --bind 0.0.0.0:${PORT:-8080}
