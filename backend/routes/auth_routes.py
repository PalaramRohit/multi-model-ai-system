from flask import Blueprint, request, jsonify, current_app
from extensions import mongo, bcrypt, jwt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson.objectid import ObjectId
from datetime import timedelta, datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({"error": "Email, password, and username are required"}), 400

    try:
        if mongo.db.users.find_one({"email": data['email']}):
            return jsonify({"error": "Email already registered"}), 400
            
        if mongo.db.users.find_one({"username": data['username']}):
            return jsonify({"error": "Username already taken"}), 400

        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        new_user = {
            "name": data.get('name', ''),
            "username": data['username'],
            "email": data['email'],
            "password": hashed_password,
            "role": "user",
            "gender": data.get('gender', ''),
            "dob": data.get('dob', ''),
            "created_at": datetime.utcnow()
        }
        
        mongo.db.users.insert_one(new_user)
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        mongo_uri = current_app.config.get('MONGO_URI', '')
        is_localhost = 'localhost' in mongo_uri or '127.0.0.1' in mongo_uri
        if is_localhost or not mongo_uri:
            return jsonify({
                "error": "Database not configured for production",
                "detail": "MONGO_URI is set to localhost. Use a MongoDB Atlas connection string in Vercel Environment Variables.",
                "fix": "Go to Vercel Dashboard > Settings > Environment Variables > Edit MONGO_URI"
            }), 503
        return jsonify({"error": "Database connection failed", "detail": str(e)}), 503

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = mongo.db.users.find_one({"email": data['email']})
        if user and bcrypt.check_password_hash(user['password'], data['password']):
            access_token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(days=1))
            
            # Send login email notification (fail-safe)
            try:
                from utils.email_helper import send_email_notification
                subject = "Secure Alert: New Login to Multi-Model AI Hub"
                body = f"""
                <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                    <h2 style="color: #00F0FF; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">New Login Detected</h2>
                    <p>Hello {user.get('name', 'User')},</p>
                    <p>You have successfully logged in to your Multi-Model AI account (<b>{user['email']}</b>).</p>
                    <p><b>Timestamp:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                    <p>All AI hubs (Medical, Agriculture, Student, Finance) are fully operational and ready for use.</p>
                    <div style="margin-top: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 10px;">
                        This is an automated security notification. If this was not you, please secure your credentials.
                    </div>
                </div>
                """
                send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to trigger login email: {mail_err}")

            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "user": {
                    "email": user['email'],
                    "name": user.get('name', 'User'),
                    "username": user.get('username', ''),
                    "role": user.get('role', 'user')
                }
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        mongo_uri = current_app.config.get('MONGO_URI', '')
        is_localhost = 'localhost' in mongo_uri or '127.0.0.1' in mongo_uri
        if is_localhost or not mongo_uri:
            return jsonify({
                "error": "Database not configured for production",
                "detail": "MONGO_URI is set to localhost. Use a MongoDB Atlas connection string in Vercel Environment Variables."
            }), 503
        return jsonify({"error": "Database connection failed", "detail": str(e)}), 503

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = mongo.db.users.find_one({"_id": ObjectId(current_user_id)})
        if user:
            return jsonify({
                "email": user['email'],
                "name": user.get('name', 'User'),
                "username": user.get('username', ''),
                "role": user.get('role', 'user'),
                "gender": user.get('gender', ''),
                "dob": user.get('dob', '')
            }), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": "Database connection failed", "detail": str(e)}), 503

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Attempt to send logout notification if token is passed or verify_jwt_in_request succeeds
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            if user:
                from utils.email_helper import send_email_notification
                subject = "Secure Alert: Logged out from Multi-Model AI Hub"
                body = f"""
                <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                    <h2 style="color: #ef4444; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Logout Alert</h2>
                    <p>Hello {user.get('name', 'User')},</p>
                    <p>We detected a logout from your Multi-Model AI Hub account (<b>{user['email']}</b>).</p>
                    <p><b>Timestamp:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                    <div style="margin-top: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 10px;">
                        This is an automated security notification. If you did not log out, please check your session settings.
                    </div>
                </div>
                """
                send_email_notification(user['email'], subject, body)
    except Exception as e:
        print(f"Logout email error: {e}")
        
    return jsonify({"message": "Logout successful"}), 200
