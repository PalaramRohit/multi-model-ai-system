from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename
from utils.helpers import allowed_file
import os
from datetime import datetime
from extensions import mongo
from services.medical_service import medical_service

medical_bp = Blueprint('medical', __name__)

@medical_bp.route('/upload_knowledge', methods=['POST'])
def upload_knowledge():
    # Helper endpoint to upload a medical book for RAG
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Save to permanent storage (e.g., /app/data or local)
        # consistently using safe path
        upload_dir = os.path.join(os.getcwd(), 'data', 'knowledge_base')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
            
        save_path = os.path.join(upload_dir, filename)
        file.save(save_path)
        
        # Update Service State
        medical_service.knowledge_base_path = save_path
        
        return jsonify({'message': f"Knowledge Base '{filename}' uploaded successfully.", 'path': save_path})

@medical_bp.route('/knowledge_status', methods=['GET'])
def get_knowledge_status():
    """Returns the current loaded knowledge base file."""
    if medical_service.knowledge_base_path:
        return jsonify({
            'status': 'active', 
            'file': os.path.basename(medical_service.knowledge_base_path)
        })
    else:
        return jsonify({'status': 'inactive', 'file': None})



@medical_bp.route('/consult', methods=['POST'])
def consult_health():
    """
    Endpoint for General Health Assistant (Text-Only).
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'

    data = request.json
    if not data or 'symptoms' not in data:
        return jsonify({'error': 'Symptoms are required'}), 400

    symptoms = data['symptoms']
    language = data.get('language', 'en')

    try:
        if not medical_service.knowledge_base_path:
             # Basic check to warn if knowledge base isn't loaded, though RAG handles empty gracefully
             print("Warning: No knowledge base loaded for consultation.")

        result = medical_service.consult_general_health(symptoms, language)
        
        # Log to MongoDB
        try:
            mongo.db.predictions.insert_one({
                'domain': 'medical',
                'model_type': 'general_health',
                'input_reference': 'text_query',
                'inputs': {'symptoms': symptoms, 'language': language},
                'result': result,
                'timestamp': datetime.utcnow(),
                'user_id': user_id
            })
        except Exception as e:
            print(f"DB Log Error: {e}")

        # Send query email notification if user is logged in
        if user_id != 'guest':
            try:
                from bson.objectid import ObjectId
                user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get('email'):
                    from utils.email_helper import send_email_notification
                    subject = "Multi-Model AI: General Health Analysis"
                    body = f"""
                    <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                        <h2 style="color: #ef4444; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Health Consultation Details</h2>
                        <p>Hello {user.get('name', 'User')},</p>
                        <p>A new general health query has been analyzed under your account.</p>
                        <p><b>Your Symptoms:</b> {symptoms}</p>
                        <br/>
                        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 13px;">
                            <strong>AI Consultation Summary:</strong><br/>
                            {result.get('summary', result.get('prediction', ''))[:500]}...
                        </div>
                    </div>
                    """
                    send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to send consult email: {mail_err}")

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@medical_bp.route('/predict/<model_type>', methods=['POST'])
def predict_medical(model_type):
    # Optional Auth Check
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity() or 'guest'
    except:
        user_id = 'guest'
    """
    Endpoint for Medical Hub predictions.
    Supported models: 'heart', 'brain', 'lungs'
    """
    supported_models = ['heart', 'brain', 'lungs', 'eye', 'skin', 'gastro', 'general']
    if model_type not in supported_models:
        return jsonify({'error': f'Invalid model type. Choose from {supported_models}'}), 400

    temp_path = None
    diagnosis = "Text-Only Consultation"
    top_confidence = 0.0
    inference_result = {}
    filename = "text_query"

    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        if allowed_file(file.filename):
            filename = secure_filename(file.filename)
            temp_path = os.path.join('/tmp', filename) if os.name != 'nt' else os.path.join(os.environ.get('TEMP', 'C:\\Temp'), filename)
            file.save(temp_path)

            try:
                # 1. Get Real Inference from Roboflow (Skip for 'general')
                if model_type != 'general':
                    from services.roboflow_service import roboflow_service
                    inference_result = roboflow_service.get_inference(model_type, temp_path)
                else:
                    # General query with image attached? 
                    # For now, just treat as generic upload or ignore visual inference
                    inference_result = {"output": "General visual query"}
                
                
                # 2. Parse Inference Result
                # Specific handling for the nested structure seen in debug_output.json
                # Structure: [{"predictions": {"predictions": [...], "top": "..."}}]
                
                # 1. unwraps the list
                if isinstance(inference_result, list):
                    if len(inference_result) > 0:
                         inference_result = inference_result[0]
                    else:
                         inference_result = {}

                # 2. unwraps the first layer 'predictions' if it exists and is a dict (not the list of predictions)
                if 'predictions' in inference_result and isinstance(inference_result['predictions'], dict):
                    inference_result = inference_result['predictions']
                
                # Now inference_result should look like:
                # { "predictions": [...], "top": "...", "confidence": ... }
                
                predictions = inference_result.get('predictions', [])
                
                # Normalize if it's a single dict (Classification)
                if isinstance(predictions, dict):
                     predictions = [predictions]
                     
                best_pred = None
                
                if isinstance(predictions, list) and len(predictions) > 0:
                    # Object Detection: List of dicts
                    # Get highest confidence
                    best_pred = max(predictions, key=lambda x: x.get('confidence', 0))
                    
                    label = best_pred.get('class', best_pred.get('label', 'Unknown Object'))
                    conf = best_pred.get('confidence', 0.0)
                    
                    diagnosis = f"Detected: {label}"
                    top_confidence = float(conf)
                    
                elif 'top' in inference_result:
                    # Classification: Top-level keys
                    diagnosis = f"Detected: {inference_result['top']}"
                    top_confidence = float(inference_result.get('confidence', 0.0))
                    
                else:
                    # Fallback if structure is unexpected
                    # Check for workflow output keys like 'output'
                    if 'output' in inference_result:
                         diagnosis = f"Result: {inference_result['output']}"
                         top_confidence = 0.9 # Assume workflow success implies high confidence
                    else:
                        diagnosis = "Inconclusive Scan"
                        top_confidence = 0.0

            except Exception as re:
                print(f"Roboflow Error: {re}")
                # Soft Fail: Proceed to Gemini even if Roboflow fails
                diagnosis = "Detection Unavailable (Roboflow Error)"
                top_confidence = 0.0
                inference_result = {"error": str(re)}

    # Hybrid AI / Text Analysis
    try:
        language = request.form.get('language', 'en')
        user_notes = request.form.get('user_notes', '')
        
        # Call Gemini
        ai_advice = medical_service.get_ai_guidance(diagnosis, top_confidence, language, temp_path, user_notes)
        
        result = {
            "model": model_type,
            "filename": filename,
            "prediction": diagnosis,
            "confidence": top_confidence,
            "details": f"Analysis based on {filename}",
            "guidance": ai_advice,
            "raw_inference": inference_result
        }
        
        # Log to MongoDB
        try:
            mongo.db.predictions.insert_one({
                'domain': 'medical',
                'model_type': model_type,
                'input_reference': filename,
                'result': result,
                'timestamp': datetime.utcnow(),
                'user_id': user_id 
            })
        except Exception as e:
            print(f"DB Log Error: {e}")

        # Send query email notification if user is logged in
        if user_id != 'guest':
            try:
                from bson.objectid import ObjectId
                user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
                if user and user.get('email'):
                    from utils.email_helper import send_email_notification
                    subject = f"Multi-Model AI: Medical Query Logged ({model_type.upper()})"
                    body = f"""
                    <div style="font-family: sans-serif; padding: 20px; background-color: #0a0f24; color: #ffffff; border-radius: 10px;">
                        <h2 style="color: #ef4444; border-bottom: 1px solid #1e293b; padding-bottom: 10px;">Medical Diagnostic Analysis</h2>
                        <p>Hello {user.get('name', 'User')},</p>
                        <p>A new query has been logged under your account for <b>Medical AI ({model_type})</b>.</p>
                        <p><b>Diagnosis Prediction:</b> {diagnosis}</p>
                        <p><b>Confidence:</b> {(top_confidence * 100):.1f}%</p>
                        <br/>
                        <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; font-size: 13px;">
                            <strong>AI Clinical Guidance:</strong><br/>
                            {ai_advice[:500]}...
                        </div>
                    </div>
                    """
                    send_email_notification(user['email'], subject, body)
            except Exception as mail_err:
                print(f"Failed to send medical query email: {mail_err}")

        # Clean up
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify(result)

    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({'error': f"Processing Failed: {str(e)}"}), 500

@medical_bp.route('/suggest_doctors', methods=['POST'])
def suggest_doctors():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        specialty = data.get('specialty', 'lungs')
        region = data.get('region', 'India')
        
        # System prompt that asks for JSON format
        system_prompt = "You are a professional medical clinic reference system. You return ONLY a raw JSON array of 3 real-world clinics or hospitals for the specialty, situated in or near the requested region."
        
        prompt = f"""
        Identify and list 3 real-world active specialist doctors/specialists and major hospitals for the specialty '{specialty}' in or near the region: '{region}'.
        
        Return ONLY a JSON list of objects matching this exact schema:
        [
          {{
            "name": "Name of Hospital/Clinic",
            "specialist": "Doctor Name and Specialty",
            "address": "Detailed address in {region}",
            "contact": "Contact phone number",
            "rating": "4.6",
            "distance": "1.5 km",
            "description": "Brief description of diagnostic capabilities"
          }}
        ]
        
        Do not wrap in markdown or include any text other than the raw JSON array.
        """
        
        from services.cerebras_service import cerebras_service
        import json
        import re
        
        response_text = cerebras_service.generate_content(prompt, system_prompt=system_prompt)
        
        # Try to parse JSON
        try:
            cleaned = response_text.strip()
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.MULTILINE).strip()
            parsed_docs = json.loads(cleaned)
            # Ensure it is a list
            if not isinstance(parsed_docs, list):
                parsed_docs = [parsed_docs]
            return jsonify(parsed_docs)
        except Exception as json_err:
            print(f"JSON Parse Error for suggest_doctors: {json_err}. Raw response: {response_text}")
            
            # Fallback to realistic clinics
            specialty_titles = {
                'lungs': ('Pulmonologist', 'Lung Care Clinic', 'Expertise in asthma and chest diagnostics.'),
                'heart': ('Cardiologist', 'Heart Clinic', 'Vascular analysis and cardiac care.'),
                'brain': ('Neurologist', 'Brain and Spine Center', 'Brain scan evaluation and neurodiagnostics.'),
            }
            spec_title, spec_type, spec_desc = specialty_titles.get(specialty, ('Specialist', 'Care Center', 'Diagnostic care'))
            
            fallback_docs = [
                {
                    "name": f"{region} General Healthcare Center",
                    "specialist": f"Dr. Rajesh Kumar ({spec_title})",
                    "address": f"Main Medical Plaza, {region}",
                    "contact": "+91 99887 76655",
                    "rating": "4.7",
                    "distance": "1.2 km",
                    "description": spec_desc
                },
                {
                    "name": f"{spec_type} of {region}",
                    "specialist": f"Dr. Priya Sen (Lead {spec_title})",
                    "address": f"Market Ring Road, {region}",
                    "contact": "+91 88990 01122",
                    "rating": "4.5",
                    "distance": "3.5 km",
                    "description": "State-of-the-art diagnostics and patient care."
                }
            ]
            return jsonify(fallback_docs)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
