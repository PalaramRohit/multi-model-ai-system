from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from services.finance_service import finance_service
from extensions import mongo
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from datetime import datetime

finance_bp = Blueprint('finance', __name__)

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@finance_bp.route('/analyze', methods=['POST'])
def analyze_finances():
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
         user_id = 'guest'
    """
    Endpoint (Finance Hub).
    Accepts 'transactions' (CSV) and optional 'budget' (CSV).
    """
    # 1. Check for Transactions file (Required)
    if 'transactions' not in request.files:
        return jsonify({'error': 'Transactions CSV file is required'}), 400
    
    trans_file = request.files['transactions']
    if trans_file.filename == '':
        return jsonify({'error': 'No selected transactions file'}), 400

    # 2. Check for Budget file (Optional)
    budget_file = request.files.get('budget')
    
    # 3. Save files temporarily
    if not allowed_file(trans_file.filename):
        return jsonify({'error': 'Invalid file type. Only CSV allowed'}), 400
        
    try:
        # Save Trans
        trans_filename = secure_filename(trans_file.filename)
        trans_path = os.path.join('/tmp', trans_filename) if os.name != 'nt' else os.path.join(os.environ.get('TEMP', 'C:\\Temp'), trans_filename)
        trans_file.save(trans_path)
        
        budget_path = None
        if budget_file and budget_file.filename != '' and allowed_file(budget_file.filename):
            budget_filename = secure_filename(budget_file.filename)
            budget_path = os.path.join('/tmp', budget_filename) if os.name != 'nt' else os.path.join(os.environ.get('TEMP', 'C:\\Temp'), budget_filename)
            budget_file.save(budget_path)

        # 4. Run Analysis
        language = request.form.get('language', 'en')
        user_goals = request.form.get('user_goals', '')
        report = finance_service.generate_report(trans_path, budget_path, language, user_goals)
        
        # Log to DB
        try:
            mongo.db.predictions.insert_one({
                'domain': 'finance',
                'model_type': 'spending_analysis',
                'input_reference': trans_filename,
                'result': {'prediction': "Financial Report Generated", 'details': report},
                'timestamp': datetime.utcnow(),
                'user_id': user_id
            })
        except Exception as e:
            print(f"DB Log Error: {e}")

        # 5. Cleanup
        if os.path.exists(trans_path):
            os.remove(trans_path)
        if budget_path and os.path.exists(budget_path):
            os.remove(budget_path)
            
        return jsonify({"report": report})

    except Exception as e:
        # 5. Cleanup in case of error
        if os.path.exists(trans_path):
             os.remove(trans_path)
        if budget_path and os.path.exists(budget_path):
             os.remove(budget_path)
        return jsonify({'error': str(e)}), 500

@finance_bp.route('/predict_bill', methods=['POST'])
def predict_bill():
    """
    Endpoint (Finance Hub).
    Accepts JSON data for hospital bill estimation.
    """
    try:
        verify_jwt_in_request(optional=True)
        # user_id = get_jwt_identity() # Can be used for logging if needed
    except:
        pass

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    result = finance_service.predict_hospital_bill(data)
    
    if 'error' in result:
        return jsonify({'error': result['error']}), 500
        
    return jsonify({'result': result})
