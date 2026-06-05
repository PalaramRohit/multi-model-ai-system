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

        # Clean up
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        
        return jsonify(result)

    except Exception as e:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({'error': f"Processing Failed: {str(e)}"}), 500
