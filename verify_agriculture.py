import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.agriculture_service import agriculture_service

def test_agriculture_service():
    print("Testing Agriculture Service with Roboflow integration...")
    image_path = "test_crop.jpg"
    
    if not os.path.exists(image_path):
        print(f"Error: {image_path} not found.")
        return

    try:
        result = agriculture_service.analyze_crop(image_path)
        print("\n--- Analysis Result ---")
        print(result)
        print("-----------------------")
        
        if "Error" in result and not "Error: Roboflow Service unavailable" in result:
             # If it's a "Service unavailable" error, it might be due to missing API key in this env, 
             # but we hardcoded it in the class (as per user request), so it should try to connect.
             pass

    except Exception as e:
        print(f"Test Failed: {e}")

if __name__ == "__main__":
    test_agriculture_service()
