from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    try:
        current_user_id = get_jwt_identity()
        user = mongo.db.users.find_one({'_id': current_user_id})
        
        if not user:
             return jsonify({'error': 'User not found'}), 404

        # Return settings or defaults
        return jsonify(user.get('settings', {})), 200

    except Exception as e:
        print(f"Get Settings Error: {e}")
        return jsonify({'error': str(e)}), 500

@settings_bp.route('/', methods=['PUT'])
@jwt_required()
def update_settings():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Update user document with new settings
        result = mongo.db.users.update_one(
            {'_id': current_user_id},
            {'$set': {'settings': data}}
        )

        if result.modified_count == 0 and result.matched_count == 0:
             return jsonify({'error': 'User not found'}), 404
             
        return jsonify({'message': 'Settings updated successfully', 'settings': data}), 200

    except Exception as e:
        print(f"Update Settings Error: {e}")
        return jsonify({'error': str(e)}), 500
