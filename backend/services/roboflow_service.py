
from inference_sdk import InferenceHTTPClient
from config import config

class RoboflowService:
    def __init__(self):
        self.api_key = config.ROBOFLOW_API_KEY
        self.api_url = config.ROBOFLOW_API_URL
        self.client = InferenceHTTPClient(
            api_url=self.api_url,
            api_key=self.api_key
        )

    def get_inference(self, model_name, image_path):
        """
        Get inference results for a specific model/workflow.
        """
        if model_name not in config.MODEL_CONFIGS:
            raise ValueError(f"Model '{model_name}' not found")

        model_config = config.MODEL_CONFIGS[model_name]
        
        if model_config.get('type') == 'workflow':
            try:
                # Use inference-sdk for workflow
                result = self.client.run_workflow(
                    workspace_name=model_config['workspace_name'],
                    workflow_id=model_config['workflow_id'],
                    images={
                        "image": image_path
                    },
                    use_cache=True
                )
                return result
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
