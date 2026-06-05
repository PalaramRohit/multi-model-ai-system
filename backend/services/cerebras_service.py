import os
import requests
import json

class CerebrasService:
    def __init__(self):
        self.api_key = os.getenv('CEREBRAS_API_KEY')
        self.base_url = "https://api.cerebras.ai/v1/chat/completions"
        if not self.api_key:
            print("Warning: CEREBRAS_API_KEY not found. Cerebras Service will be disabled.")

    def generate_content(self, prompt, system_prompt="You are a helpful AI assistant."):
        """
        Generates content using Llama 3.1 8B via Cerebras using requests.
        """
        if not self.api_key:
            return "Cerebras Service unavailable (Missing API Key)."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-oss-120b",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 2048
        }

        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']
        except Exception as e:
            print(f"Cerebras Error: {e}")
            return f"Failed to generate content via Cerebras: {str(e)}"

# Initialize service
cerebras_service = CerebrasService()
