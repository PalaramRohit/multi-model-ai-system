import sys
import os

# Fix Vercel Python path: CWD is project root (/var/task),
# but all modules (config, extensions, routes, services) live in backend/.
# This must be FIRST before any local imports.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from config import config
from extensions import mongo, bcrypt, jwt


# Path to the built React frontend (committed to git)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, 'frontend', 'dist')


def create_app():
    app = Flask(__name__, static_folder=None)

    # ── CORS ────────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # ── Config ──────────────────────────────────────────────────────────────
    app.config.from_object(config)
    app.config.setdefault('JWT_SECRET_KEY', config.JWT_SECRET_KEY)

    # ── Extensions ──────────────────────────────────────────────────────────
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ── Blueprints ──────────────────────────────────────────────────────────
    from routes.auth_routes import auth_bp
    from routes.medical_routes import medical_bp
    from routes.student_routes import student_bp
    from routes.finance_routes import finance_bp
    from routes.agriculture_routes import agriculture_bp
    from routes.dashboard_routes import dashboard_bp
    from routes.settings_routes import settings_bp
    from routes.tts_routes import tts_bp
    from routes.billing_routes import billing_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp,        url_prefix='/api/auth')
    app.register_blueprint(medical_bp,     url_prefix='/api/medical')
    app.register_blueprint(student_bp,     url_prefix='/api/student')
    app.register_blueprint(finance_bp,     url_prefix='/api/finance')
    app.register_blueprint(agriculture_bp, url_prefix='/api/agriculture')
    app.register_blueprint(dashboard_bp,   url_prefix='/api/dashboard')
    app.register_blueprint(settings_bp,    url_prefix='/api/settings')
    app.register_blueprint(tts_bp,         url_prefix='/api/tts')
    app.register_blueprint(billing_bp,     url_prefix='/api/billing')
    app.register_blueprint(admin_bp,       url_prefix='/api/admin')

    # ── Health check ────────────────────────────────────────────────────────
    @app.route('/api/health', methods=['GET'])
    def health_check():
        mongo_uri = app.config.get('MONGO_URI', '')
        is_localhost = 'localhost' in mongo_uri or '127.0.0.1' in mongo_uri
        db_status = "unknown"
        db_error = None
        try:
            mongo.db.command('ping')
            db_status = "connected"
        except Exception as e:
            db_status = "error"
            db_error = str(e)
        return jsonify({
            "status": "healthy",
            "service": "MultiModAI Backend",
            "db_status": db_status,
            "db_type": "localhost" if is_localhost else "atlas",
            "db_error": db_error,
            "mongo_uri_set": bool(mongo_uri),
        }), 200

    # ── Serve React static assets (JS, CSS, images, etc.) ───────────────────
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), filename)

    @app.route('/india_map.svg')
    def serve_svg():
        return send_from_directory(FRONTEND_DIST, 'india_map.svg')

    # ── Catch-all: serve React SPA for all non-API routes ───────────────────
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        # Let actual file requests through
        if path and os.path.isfile(os.path.join(FRONTEND_DIST, path)):
            return send_from_directory(FRONTEND_DIST, path)
        # Serve index.html for all React Router paths
        return send_from_directory(FRONTEND_DIST, 'index.html')

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000,
            use_reloader=True, reloader_type='stat')