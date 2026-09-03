import sys
import json
sys.path.insert(0, 'c:/Users/palar/OneDrive/Documents/ai-multimodel/backend')
from services.roboflow_service import roboflow_service

try:
    # Try all models
    models = ['heart', 'brain', 'lungs', 'eye', 'skin', 'gastro']
    for model in models:
        print(f"Testing {model}...")
        try:
            res = roboflow_service.get_inference(model, 'c:/Users/palar/OneDrive/Documents/ai-multimodel/test_crop.jpg')
            print(f"Result for {model}: {json.dumps(res)[:200]}")
        except Exception as e:
            print(f"Error for {model}: {e}")
except Exception as e:
    print(e)
