from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from utils.helpers import allowed_file
import os
from extensions import mongo
from services.agriculture_service import agriculture_service
from datetime import datetime
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

agriculture_bp = Blueprint('agriculture', __name__)

@agriculture_bp.route('/analyze_crop', methods=['POST'])
def analyze_crop():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Use cross-platform temp path
        import tempfile
        temp_path = os.path.join(tempfile.gettempdir(), filename)
        file.save(temp_path)

        try:
            # Call Gemini Vision Service
            language = request.form.get('language', 'en')
            user_notes = request.form.get('user_notes', '')
            analysis_result = agriculture_service.analyze_crop(temp_path, language, user_notes)
            
            # Log to DB
            try:
                mongo.db.predictions.insert_one({
                    'domain': 'agriculture',
                    'model_type': 'crop_analysis',
                    'input_reference': filename,
                    'result': {'prediction': analysis_result},
                    'timestamp': datetime.utcnow(),
                    'user_id': user_id
                })
            except Exception as e:
                print(f"DB Logging Error: {e}")

            return jsonify({'result': analysis_result})

        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

@agriculture_bp.route('/recommend', methods=['POST'])
def recommend_crop():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'

    data = request.json
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    try:
        recommendation = agriculture_service.recommend_crop(data)
        
        # Log to DB (optional, simplified for now)
        try:
            mongo.db.predictions.insert_one({
                'domain': 'agriculture',
                'model_type': 'crop_recommendation',
                'inputs': data,
                'result': {'prediction': recommendation},
                'timestamp': datetime.utcnow(),
                'user_id': user_id
            })
        except Exception as e:
            print(f"DB Logging Error: {e}")

        return jsonify({'result': recommendation})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
