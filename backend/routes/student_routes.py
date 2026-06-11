from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from services.education_service import education_service
from datetime import datetime
from extensions import mongo
from werkzeug.utils import secure_filename
import os

student_bp = Blueprint('student', __name__)

@student_bp.route('/analyze', methods=['POST'])
def analyze_student():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'
    
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        result = education_service.analyze_profile(data)
        
        # Log to MongoDB
        try:
            prediction_summary = "Career Guidance Generated"
            if isinstance(result, dict) and 'summary' in result:
                 prediction_summary = result['summary']
            
            mongo.db.predictions.insert_one({
                'domain': 'student',
                'model_type': 'edumentor',
                'result': {'prediction': prediction_summary, 'full_response': result.get('advice', '')},
                'timestamp': datetime.utcnow(),
                'user_id': user_id
            })
        except Exception as e:
            print(f"DB Log Error: {e}")

        # Send query email notification if user is logged in
        if user_id != 'guest':
            try:
                user = mongo.db.users.find_one({"_id": mongo.db.users.find_one({"_id": os.sys.modules['bson'].ObjectId(user_id)})['_id']})
                if user and user.get('email'):
                    from utils.email_helper import send_email_notification
                    subject = "Multi-Model AI: Career Roadmap & Skill Gap Generated"
                    body = f"""
                    <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                        <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Edu Mentor Career Advisor</h2>
                        <p>Hello {user.get('name', 'User')},</p>
                        <p>Your Career Pathway Roadmap and Skill Gap Analysis have been generated successfully!</p>
                        <p>You can view the full details in the Student AI Hub on your dashboard.</p>
                        <br/>
                        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 13px; max-height: 250px; overflow-y: auto;">
                            <strong>Guidance Summary:</strong><br/>
                            {result.get('advice', '')[:500]}...
                        </div>
                    </div>
                    """
                    send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to trigger student query email: {mail_err}")

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/read_resume', methods=['POST'])
def read_resume():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(file.filename)
    temp_dir = os.path.join(os.environ.get('TEMP', 'C:\\Temp')) if os.name == 'nt' else '/tmp'
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    temp_path = os.path.join(temp_dir, filename)
    file.save(temp_path)

    try:
        result = education_service.read_resume(temp_path)
        
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if 'error' in result:
            return jsonify(result), 400

        # Send email alert to user
        if user_id != 'guest':
            try:
                from bson.objectid import ObjectId
                user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get('email'):
                    from utils.email_helper import send_email_notification
                    subject = "Multi-Model AI: Resume Parsed Successfully"
                    body = f"""
                    <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                        <h2 style="color: #3b82f6; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Resume Parsing Notification</h2>
                        <p>Hello {user.get('name', 'User')},</p>
                        <p>Your resume (<b>{filename}</b>) was successfully parsed by our AI models.</p>
                        <p>Your profile skills, experience, and bio fields have been auto-populated in the Student Hub.</p>
                    </div>
                    """
                    send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to send resume parse email: {mail_err}")

        return jsonify(result)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({'error': str(e)}), 500

@student_bp.route('/mock_interview', methods=['POST'])
def mock_interview():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'

    try:
        data = request.json
        role = data.get('role', 'Software Engineer')
        difficulty = data.get('difficulty', 'Medium')
        history = data.get('history', [])

        result = education_service.generate_interview_flow(role, difficulty, history)

        # Log prediction to MongoDB if finished or start
        if result.get('finished') or len(history) == 0:
            try:
                mongo.db.predictions.insert_one({
                    'domain': 'student',
                    'model_type': 'mock_interview',
                    'result': {
                        'prediction': f"Mock Interview for {role} ({difficulty})",
                        'score': result.get('score', 0),
                        'feedback': result.get('feedback', '')
                    },
                    'timestamp': datetime.utcnow(),
                    'user_id': user_id
                })
            except Exception as e:
                print(f"DB Log Error for Interview: {e}")

        # Send email summary on completion
        if result.get('finished') and user_id != 'guest':
            try:
                from bson.objectid import ObjectId
                user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get('email'):
                    from utils.email_helper import send_email_notification
                    subject = f"Multi-Model AI: Mock Interview for {role} Complete"
                    body = f"""
                    <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                        <h2 style="color: #00F0FF; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Interview Complete</h2>
                        <p>Hello {user.get('name', 'User')},</p>
                        <p>Congratulations on completing your mock interview for <b>{role}</b> ({difficulty} difficulty).</p>
                        <h3 style="color: #10B981;">Final Score: {result.get('score', 0)} / 10</h3>
                        <p><b>Feedback:</b> {result.get('feedback')}</p>
                    </div>
                    """
                    send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to send mock interview complete email: {mail_err}")

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
