
import base64
import requests
from config import config

class RoboflowService:
    def __init__(self):
        self.api_key = config.ROBOFLOW_API_KEY
        self.api_url = config.ROBOFLOW_API_URL or "https://serverless.roboflow.com"

    def get_inference(self, model_name, image_path):
        """
        Get inference results for a specific model/workflow.
        """
        if model_name not in config.MODEL_CONFIGS:
            raise ValueError(f"Model '{model_name}' not found")

        model_config = config.MODEL_CONFIGS[model_name]
        
        if model_config.get('type') == 'workflow':
            try:
                workspace_name = model_config['workspace_name']
                workflow_id = model_config['workflow_id']
                
                # Read local image and encode to base64
                with open(image_path, "rb") as image_file:
                    image_data = base64.b64encode(image_file.read()).decode("utf-8")
                
                # Prepare payload
                payload = {
                    "api_key": self.api_key,
                    "inputs": {
                        "image": {
                            "type": "base64",
                            "value": image_data
                        }
                    }
                }
                
                # API Endpoint URL
                url = f"{self.api_url}/infer/workflows/{workspace_name}/{workflow_id}"
                response = requests.post(url, json=payload, timeout=30)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"Roboflow API error {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"Roboflow Workflow Error: {e}")
                raise e # Re-raise to be caught by route handler
        else:
            # Fallback for standard models (mock for now to prevent crash if config is wrong)
            print(f"Model {model_name} is configured as 'model' type (Standard). Returning mock data for stability.")
            return {
                "predictions": [
                    {"class": "Mock Detection", "confidence": 0.85}
                ]
            }

# Initialize service
roboflow_service = RoboflowService()
