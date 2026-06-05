from flask import Flask
from flask_cors import CORS

from config import config
from extensions import mongo, bcrypt, jwt

def create_app():
    app = Flask(__name__)
    # Allow CORS for all domains for now, supports credentials
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config.from_object(config)
    
    # Initialize MongoDB
    # Initialize MongoDB and Auth
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
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
    
    app.register_blueprint(medical_bp, url_prefix='/api/medical')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(finance_bp, url_prefix='/api/finance')
    app.register_blueprint(agriculture_bp, url_prefix='/api/agriculture')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')
    app.register_blueprint(tts_bp, url_prefix='/api/tts')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=True, reloader_type='stat')
 