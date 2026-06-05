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
                "detail": "MONGO_URI environment variable is missing or set to localhost. Set MONGO_URI to a MongoDB Atlas connection string in Vercel Environment Variables.",
                "fix": "Go to Vercel Dashboard > Your Project > Settings > Environment Variables > Add MONGO_URI"
            }), 503
        return jsonify({"error": "Database error. Please try again later.", "detail": str(e)}), 503

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = mongo.db.users.find_one({"email": data['email']})
        if user and bcrypt.check_password_hash(user['password'], data['password']):
            access_token = create_access_token(identity=str(user['_id']), expires_delta=timedelta(days=1))
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
                "detail": "MONGO_URI environment variable is missing or set to localhost. Set MONGO_URI to a MongoDB Atlas connection string in Vercel Environment Variables."
            }), 503
        return jsonify({"error": "Database error. Please try again later."}), 503

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
        return jsonify({"error": "Database error. Please try again later."}), 503

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Client-side clears the token. 
    # For server-side, we would add to a blocklist here if implemented.
    return jsonify({"message": "Logout successful"}), 200
