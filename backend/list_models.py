from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment.")
    exit()

client = genai.Client(api_key=api_key)

print("Listing available models...")
try:
    for m in client.models.list():
        # The new SDK might have different attributes, checking based on common usage
        print(f"Name: {m.name}, Supported Methods: {m.supported_generation_methods}")
except Exception as e:
    print(f"Error listing models: {e}")
