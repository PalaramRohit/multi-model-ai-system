import os
import json
import base64
import requests
from extensions import mongo
from datetime import datetime
from PIL import Image
from google import genai

from services.cerebras_service import cerebras_service
from services.gemini_utils import generate_content_with_retry

class AgricultureService:
    def __init__(self):
        # Roboflow Configuration
        self.rf_api_key = os.getenv('ROBOFLOW_API_KEY')
        self.workspace_name = "multimodelai-2dvdi"
        self.workflow_id = "custom-workflow-6"
        self.api_url = "https://serverless.roboflow.com"

        # Gemini Configuration using new SDK
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if self.gemini_api_key:
            self.gemini_client = genai.Client(api_key=self.gemini_api_key)
            self.model_id = 'gemini-2.5-flash'
            self.fallback_model_ids = [
                'gemini-2.5-flash-lite',
                'gemini-flash-lite-latest',
                'gemini-2.0-flash',
            ]
        else:
            self.gemini_client = None
            self.fallback_model_ids = []

    def analyze_crop(self, image_path, language='en', user_notes=''):
        """
        Analyzes a crop image using 3-Model Hybrid (Roboflow + Llama + Gemini).
        """
        try:
            # 1. Run Roboflow Workflow via REST API
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")
            
            payload = {
                "api_key": self.rf_api_key,
                "inputs": {
                    "image": {
                        "type": "base64",
                        "value": image_data
                    }
                }
            }
            
            url = f"{self.api_url}/infer/workflows/{self.workspace_name}/{self.workflow_id}"
            response = requests.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
            else:
                raise Exception(f"Roboflow API error {response.status_code}: {response.text}")
            workflow_output_str = json.dumps(result, indent=2)

            # 2. Llama Perspective
            llama_prompt = f"""
            Analyze this Agriculture Vision Output for a farmer:
            Farmer's Note: {user_notes}
            
            Provide a technical agricultural assessment of the disease/pest.
            """
            llama_analysis = cerebras_service.generate_content(llama_prompt, "You are a senior agricultural scientist.")

            # 3. Gemini Visual & Synthesis
            if self.gemini_client:
                synthesis_prompt = f"""
                You are the Chief Agricultural Officer. I have 3 sources of info:
                1. Vision Engine Data: {workflow_output_str}
                2. Llama 3.1 Expert Opinion: {llama_analysis}
                3. Farmer's Observation: {user_notes}
                
                **Your Task:**
                Generate a final consolidated report in {language}.
                - State the condition accurately.
                - Provide immediate practical steps for the farmer.
                - Cross-verify the Llama analysis against the Vision data.
                - End with: "*This output is cross-verified by 3 AI models (Roboflow, Llama 3.1, and Gemini) for maximum reliability.*"
                """
                
                try:
                    import PIL.Image
                    img = PIL.Image.open(image_path)
                    response = generate_content_with_retry(
                        self.gemini_client,
                        self.model_id,
                        [synthesis_prompt, img],
                        fallback_model_ids=self.fallback_model_ids,
                        attempts=1,
                        operation_name="Agriculture crop analysis",
                    )
                    return {
                        "roboflow": result,
                        "gemini": response.text
                    }
                except Exception as e:
                    print(f"Agriculture Gemini fallback: {e}")
                    return {
                        "roboflow": result,
                        "llama": llama_analysis,
                        "gemini": "Gemini was temporarily unavailable. Showing Roboflow and Llama analysis only."
                    }
            else:
                return {"roboflow": result, "llama": llama_analysis, "gemini": "Gemini Service Unavailable"}

        except Exception as e:
            return f"Failed to analyze crop: {str(e)}"

    def recommend_crop(self, data):
        """
        Dual-Model Recommendation using Llama & Gemini.
        """
        if not self.gemini_client: return {"error": "AI Service unavailable"}

        language = data.get('language', 'en')
        context = f"Soil: {data.get('soil_type')}, pH: {data.get('ph')}, Water: {data.get('water')}, Location: {data.get('location')}"

        try:
            llama_advice = cerebras_service.generate_content(f"Recommend crops for: {context}", "You are a cropping expert.")
            
            prompt = f"""
            Expert 1 (Llama) suggested: {llama_advice}
            Context: {context}
            
            Refine this into a final 3-crop recommendation in {language}. 
            Include expected costs, profit, and risk levels in a Markdown Table.
            """

            response = generate_content_with_retry(
                self.gemini_client,
                self.model_id,
                prompt,
                fallback_model_ids=self.fallback_model_ids,
                attempts=1,
                operation_name="Agriculture crop recommendation",
            )
            return response.text
        except Exception as e:
            return f"Failed to recommend crops: {str(e)}\n\nLlama fallback:\n{llama_advice if 'llama_advice' in locals() else ''}"

# Initialize service
agriculture_service = AgricultureService()
