"""
Production WSGI entrypoint for Vercel.

This file lives at the project root. It explicitly adds backend/ to
sys.path before importing the Flask app, so Vercel's Python runner
can resolve all internal modules (config, extensions, routes, services).
"""
import sys
import os

# ── Critical: add backend/ to Python module search path ────────────────────
# Vercel sets CWD to /var/task (project root).
# All backend modules live in /var/task/backend/.
# Without this, 'from config import config' raises ModuleNotFoundError.
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ── Import the Flask application ────────────────────────────────────────────
from app import app  # noqa: E402  (backend/app.py)

# ── Local dev runner ────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
