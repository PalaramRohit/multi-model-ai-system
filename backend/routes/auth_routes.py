from flask import Blueprint, request, jsonify
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
        "role": "user",  # Default role
        "gender": data.get('gender', ''),
        "dob": data.get('dob', ''),
        "created_at": datetime.utcnow()
    }
    
    mongo.db.users.insert_one(new_user)
    
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

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

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
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

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Client-side clears the token. 
    # For server-side, we would add to a blocklist here if implemented.
    return jsonify({"message": "Logout successful"}), 200
