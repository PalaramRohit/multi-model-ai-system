import requests
import json
import os

# CONFIG
url = "http://localhost:5000/api/predict/lungs"
image_path = r"C:/Users/palar/.gemini/antigravity/brain/0d641959-8319-4234-a684-8f97538e067d/uploaded_image_1768648094397.png"

if not os.path.exists(image_path):
    print(f"Error: File not found at {image_path}")
    exit(1)

# Send request
try:
    print(f"Sending request to {url}...")
    with open(image_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files) 
    
    print(f"Status Code: {response.status_code}")
    
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        # Save to debug file
        with open('debug_output.json', 'w') as f:
            json.dump(data, f, indent=2)
            print("Output written to debug_output.json")
    except:
        print("Response text:", response.text)

except Exception as e:
    print(f"Request failed: {str(e)}")
