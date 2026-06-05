from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mongo
import json

dashboard_bp = Blueprint('dashboard', __name__)

def _safe_prediction(prediction):
    if isinstance(prediction, str):
        return prediction
    if prediction is None:
        return 'Processed'
    try:
        return json.dumps(prediction, ensure_ascii=False)
    except Exception:
        return str(prediction)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
        current_user_id = get_jwt_identity()
        
        # 1. Total Queries
        total_queries = mongo.db.predictions.count_documents({'user_id': current_user_id})
        
        # 2. Hub Usage Stats
        pipeline = [
            {'$match': {'user_id': current_user_id}},
            {'$group': {'_id': '$domain', 'count': {'$sum': 1}}}
        ]
        usage_stats = list(mongo.db.predictions.aggregate(pipeline))
        
        # Format stats for frontend
        stats = {
            'medical': 0,
            'agriculture': 0,
            'finance': 0,
            'student': 0
        }
        for item in usage_stats:
            domain = item['_id']
            if domain in stats:
                stats[domain] = item['count']
                
        # 3. Recent Activity (Last 5)
        recent_cursor = mongo.db.predictions.find({'user_id': current_user_id}).sort('timestamp', -1).limit(5)
        recent_activity = []
        for doc in recent_cursor:
            raw_prediction = doc.get('result', {}).get('prediction', 'Processed')
            recent_activity.append({
                'id': str(doc['_id']),
                'domain': doc.get('domain', 'general'),
                'model': doc.get('model_type', 'unknown'),
                'prediction': _safe_prediction(raw_prediction),
                'timestamp': doc.get('timestamp').isoformat() if doc.get('timestamp') else None
            })

        return jsonify({
            'total_queries': total_queries,
            'stats': stats,
            'recent_activity': recent_activity
        }), 200


    except Exception as e:
        print(f"Dashboard Error: {e}")
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/history', methods=['GET'])
@jwt_required()
def get_dashboard_history():
    try:
        current_user_id = get_jwt_identity()
        
        # Fetch all history, sorted by newest first
        cursor = mongo.db.predictions.find({'user_id': current_user_id}).sort('timestamp', -1)
        
        history = []
        for doc in cursor:
            raw_prediction = doc.get('result', {}).get('prediction', 'Processed')
            history.append({
                'id': str(doc['_id']),
                'domain': doc.get('domain', 'general'),
                'model': doc.get('model_type', 'unknown'),
                'prediction': _safe_prediction(raw_prediction),
                'details': doc.get('result', {}), # Include full details for the detailed view
                'timestamp': doc.get('timestamp').isoformat() if doc.get('timestamp') else None
            })

        return jsonify(history), 200

    except Exception as e:
        print(f"History Error: {e}")
        return jsonify({'error': str(e)}), 500
