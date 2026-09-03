# Use official slim Python 3.11 image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside container
WORKDIR /app

# Install system dependencies needed for image processing (Pillow), PDF processing, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependency requirements first to leverage Docker cache
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend files and root wsgi entrypoint
COPY . /app

# Default port (Cloud Run will override PORT to 8080 or specified container port)
ENV PORT=5000
EXPOSE 5000

# Run WSGI production server using gunicorn with dynamic $PORT binding
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 4 --timeout 120 wsgi:app

