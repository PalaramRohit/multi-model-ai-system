from flask import Blueprint, request, jsonify
from services.billing_service import billing_service
from werkzeug.utils import secure_filename
from utils.helpers import allowed_file
import os

billing_bp = Blueprint('billing', __name__)

@billing_bp.route('/analyze', methods=['POST'])
def analyze_bill():
    """
    Endpoint to analyze a billing scenario.
    Expects form-data: 
    - hospital_name
    - city
    - room_type
    - admission_reason
    - policy_file (optional file)
    """
    try:
        hospital_name = request.form.get('hospital_name', 'Unknown Hospital')
        city = request.form.get('city', 'Unknown City')
        room_type = request.form.get('room_type', 'General Ward')
        admission_reason = request.form.get('admission_reason', 'General Checkup')
        duration = request.form.get('duration', '3')
        age = request.form.get('age', '30')
        treatment_type = request.form.get('treatment_type', 'Medical Management')
        tier = request.form.get('tier', 'Tier-1')
        gender = request.form.get('gender', 'Male')
        icu_days = request.form.get('icu_days', '0')
        surgery_complexity = request.form.get('surgery_complexity', 'Medium')
        emergency = request.form.get('emergency', 'false')
        implant = request.form.get('implant', 'false')
        network_hospital = request.form.get('network_hospital', 'true')
        
        temp_path = None
        if 'policy_file' in request.files:
            file = request.files['policy_file']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Create temp directory if it doesn't exist
                temp_dir = os.path.join(os.environ.get('TEMP', '/tmp'))
                if not os.path.exists(temp_dir):
                     os.makedirs(temp_dir)

                temp_path = os.path.join(temp_dir, filename)
                file.save(temp_path)
        
        # Call Service
        result = billing_service.analyze_billing_scenario(
            hospital_name,
            city,
            room_type,
            admission_reason,
            duration,
            age,
            treatment_type,
            tier,
            gender,
            icu_days,
            surgery_complexity,
            emergency,
            implant,
            network_hospital,
            temp_path
        )
        
        # Cleanup
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
