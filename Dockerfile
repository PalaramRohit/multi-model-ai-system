# ── Stage 1: Build React Frontend ─────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source files and build production static bundle
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python Flask Backend + Static Frontend ──────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed for image processing (Pillow), PDF, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependency requirements first to leverage Docker cache
COPY requirements.txt /app/requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy complete project backend and assets
COPY . /app

# Copy built frontend static dist folder from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Default port (Cloud Run sets PORT to 8080 automatically)
ENV PORT=5000
EXPOSE 5000

# Run WSGI production server using gunicorn
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 wsgi:app
