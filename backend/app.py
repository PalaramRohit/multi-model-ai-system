from flask import Flask, jsonify, request
from flask_cors import CORS

from config import config
from extensions import mongo, bcrypt, jwt


class PrefixMiddleware(object):
    """WSGI middleware that prepends /api to PATH_INFO if Vercel strips it.

    Vercel's experimentalServices strips the routePrefix (/api) before
    forwarding requests to the Flask serverless function. This middleware
    transparently restores the prefix so Flask blueprints (registered with
    url_prefix='/api/...') continue to match correctly.
    """

    def __init__(self, wsgi_app, prefix='/api'):
        self.wsgi_app = wsgi_app
        self.prefix = prefix

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        # Save the original path for diagnostics / catch-all logging
        environ['ORIGINAL_PATH_INFO'] = path
        # Only prepend if the prefix is genuinely missing
        if path != self.prefix and not path.startswith(self.prefix + '/'):
            environ['PATH_INFO'] = self.prefix + path
        return self.wsgi_app(environ, start_response)


def create_app():
    app = Flask(__name__)

    # ── CORS: allow all origins (tighten in production if needed) ──────────
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # ── Config ──────────────────────────────────────────────────────────────
    app.config.from_object(config)
    # Ensure JWT has a non-default secret (must be set via Vercel env vars)
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
        return jsonify({"status": "healthy", "service": "MultiModAI Backend"}), 200

    # ── Catch-all diagnostic (must be LAST) ─────────────────────────────────
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        original = request.environ.get('ORIGINAL_PATH_INFO', '/' + path)
        return jsonify({
            "error": "Flask Route Not Found",
            "original_path": original,
            "received_path": request.path,
            "registered_blueprints": list(app.blueprints.keys()),
        }), 404

    # ── Apply prefix middleware AFTER all routes are registered ────────────
    app.wsgi_app = PrefixMiddleware(app.wsgi_app)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000,
            use_reloader=True, reloader_type='stat')