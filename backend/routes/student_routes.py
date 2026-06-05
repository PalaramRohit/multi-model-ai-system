from flask import Blueprint, request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from services.education_service import education_service
from datetime import datetime
from extensions import mongo

student_bp = Blueprint('student', __name__)

@student_bp.route('/analyze', methods=['POST'])
def analyze_student():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'
    """
    Endpoint for EduMentor (Student Hub).
    analyzes student profile and gives career advice.
    """
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # result is expected to be a dict or string
        result = education_service.analyze_profile(data)
        
        # Log to MongoDB
        try:
            # Ensure result is serializable and has a 'prediction' field for history
            prediction_summary = "Career Guidance Generated"
            if isinstance(result, dict) and 'summary' in result:
                 prediction_summary = result['summary']
            
            mongo.db.predictions.insert_one({
                'domain': 'student',
                'model_type': 'edumentor',
                'result': {'prediction': prediction_summary, 'full_response': result},
                'timestamp': datetime.utcnow(),
                'user_id': user_id
            })
        except Exception as e:
            print(f"DB Log Error: {e}")

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
