from google import genai
from config import config
import os
from extensions import mongo
from datetime import datetime

from services.cerebras_service import cerebras_service
from services.gemini_utils import generate_content_with_retry

class EducationService:
    def __init__(self):
        # Initialize Gemini using new SDK
        self.api_key = os.getenv('GEMINI_API_KEY')
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            self.model_id = 'gemini-2.5-flash'
            self.fallback_model_ids = [
                'gemini-2.5-flash-lite',
                'gemini-flash-lite-latest',
                'gemini-2.0-flash',
            ]
        else:
            self.client = None
            self.fallback_model_ids = []
            print("Warning: GEMINI_API_KEY not found. Education Service will not work.")

    def analyze_profile(self, data):
        """
        Dual-Model Analysis (Llama + Gemini).
        """
        if not self.client: return {"error": "LLM Service not configured."}

        # profile_str = f"CGPA: {data.get('cgpa')}, Skills: {data.get('skills')}, Bio: {data.get('bio')}"
        # Simplified for replacement
        profile_str = f"CGPA: {data.get('cgpa', 'N/A')}, Skills: {data.get('skills', 'N/A')}, Bio: {data.get('bio', 'N/A')}"

        try:
            # 1. Llama Analysis
            llama_advice = cerebras_service.generate_content(
                f"Analyze this student profile and suggest careers: {profile_str}",
                "You are an expert career counselor."
            )

            # 2. Gemini Synthesis & Final Output
            prompt = f"""
            You are the Master Education Mentor.
            Expert 1 (Llama) suggests: {llama_advice}
            Student Profile: {profile_str}
            
            **Your Task:**
            Generate a high-quality career guidance report in {data.get('language', 'en')}.
            *This output is cross-verified by Llama 3.1 and Gemini.*
            """

            response = generate_content_with_retry(
                self.client,
                self.model_id,
                prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Education guidance synthesis",
            )
            result = {"advice": response.text}
            
            # Log to MongoDB
            try:
                mongo.db.predictions.insert_one({
                    'model_type': 'education_hybrid',
                    'input': profile_str,
                    'result': result,
                    'timestamp': datetime.utcnow()
                })
            except: pass

            return result
        except Exception as e:
            return {
                "advice": f"{llama_advice}\n\nNote: Gemini was temporarily unavailable, so this guidance is based on Llama analysis only."
                if 'llama_advice' in locals()
                else f"Failed to generate advice: {str(e)}"
            }

# Initialize service
education_service = EducationService()

# Initialize service
education_service = EducationService()
