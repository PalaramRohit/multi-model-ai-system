import os
from dotenv import load_dotenv

# Load environment variables from backend/.env explicitly so startup
# does not depend on the current working directory.
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class Config:
    # Roboflow Creds
    ROBOFLOW_API_KEY = os.getenv('ROBOFLOW_API_KEY', 'Ew5Wxi1GentOoQGsNUUl')
    ROBOFLOW_API_URL = "https://serverless.roboflow.com"
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ai_platform')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default_secret_key_change_me')

    # Model configurations
    MODEL_CONFIGS = {
        'heart': {
            'type': 'workflow', 
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'custom-workflow-5',
            'limit': 1,
            'confidence': 0.5
        },
        'brain': {
            'type': 'workflow',
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'custom-workflow-4',
            'limit': 1,
            'confidence': 0.5
        },
        'lungs': {
            'type': 'workflow',
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'custom-workflow-3',
            'limit': 1,
            'confidence': 0.5
        },
        'eye': {
            'type': 'workflow',
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'eye-disease-detection',
            'limit': 1,
            'confidence': 0.5
        },
        'skin': {
            'type': 'workflow',
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'skin-disease-detection',
            'limit': 1,
            'confidence': 0.5
        },
        'gastro': {
            'type': 'workflow',
            'workspace_name': 'multimodelai-2dvdi',
            'workflow_id': 'gastro-disease-detection',
            'limit': 1,
            'confidence': 0.5
        }
    }
    
    # API Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'}

# Initialize config
config = Config()
