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
        Provides a separated Career Roadmap and Skill Gap analysis.
        """
        if not self.client: return {"error": "LLM Service not configured."}

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
            Generate a detailed Career Roadmap and a Skill Gap Analysis in {data.get('language', 'en')}.
            
            Please organize your response into these exact sections with these markdown headers:
            
            # Career Pathway Roadmap
            Provide a step-by-step career milestone pathway.
            
            # Skill Gap Analysis
            Compare the skills the student has ({data.get('skills', 'N/A')}) against industry standards. Outline which skills are missing and provide a checklist or list of key areas to study next.
            
            # Recommended Resources
            Suggest specific courses, certifications, and project ideas.
            
            Make the response highly professional, actionable, and encouraging.
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

    def read_resume(self, file_path):
        """
        Parses text or PDF resume, uses Gemini to extract skills, CGPA, experience level, and bio.
        """
        if not self.client:
            return {"error": "LLM Service not configured."}

        text_content = ""
        ext = os.path.splitext(file_path)[1].lower()

        try:
            if ext == '.pdf':
                import pypdf
                reader = pypdf.PdfReader(file_path)
                for page in reader.pages:
                    text_content += page.extract_text() or ""
            else:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text_content = f.read()
            
            if not text_content.strip():
                return {"error": "No readable text content found in resume."}

            prompt = f"""
            You are an expert AI resume parser. Read the following resume text and extract key details:
            - skills: A comma-separated list of technical/non-technical skills (e.g. Python, SQL, Project Management).
            - experience: Choose EXACTLY one of: Beginner, Intermediate, Advanced.
            - bio: A short, compelling professional summary (max 3 sentences) summarizing their profile.
            - cgpa: Extract their CGPA/GPA if mentioned (e.g. "8.5/10", "3.8 GPA"), otherwise leave blank.

            Resume Text:
            {text_content[:6000]}

            Return ONLY a raw JSON object with keys: "skills", "experience", "bio", "cgpa". Do not format as markdown. Do not include ```json or any other text.
            """

            response = generate_content_with_retry(
                self.client,
                self.model_id,
                prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Resume parsing",
            )
            
            import json
            import re
            cleaned_response = response.text.strip()
            # Clean up potential markdown formatting
            cleaned_response = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned_response, flags=re.MULTILINE).strip()
            parsed_data = json.loads(cleaned_response)
            return parsed_data
            
        except Exception as e:
            print(f"Error parsing resume: {e}")
            return {"error": f"Failed to parse resume: {str(e)}"}

    def generate_interview_flow(self, role, difficulty, history):
        """
        Simulates an interviewer.
        If history is empty, generates the first question.
        Otherwise, evaluates the last response and generates the next question.
        Returns: { "score": int, "feedback": str, "next_question": str, "finished": bool }
        """
        if not self.client:
            return {"error": "LLM Service not configured."}

        history_str = ""
        for idx, item in enumerate(history):
            role_label = "Interviewer" if item.get('role') == 'interviewer' else "Candidate"
            history_str += f"{role_label}: {item.get('content')}\n"

        prompt = f"""
        You are a seasoned technical interviewer conducting a mock interview for the role of '{role}' with '{difficulty}' difficulty.
        
        Current conversation history:
        {history_str}
        
        Your task:
        1. If the history is empty, generate the first interview question. Do not score or evaluate anything. Set score to 0, feedback to "First question", next_question to your question, and finished to false.
        2. If the candidate just answered (the last message is from Candidate), evaluate their answer. Provide a score from 1 to 10 (10 being perfect) and constructive feedback on how to improve.
        3. If we have asked 4 questions already (candidate has answered 3 times), set finished to true, next_question to "Interview Completed!", and provide the final feedback summarizing their strengths/weaknesses.
        4. Otherwise, generate the next interview question. Set finished to false.

        Return ONLY a raw JSON object matching this schema:
        {{
            "score": <integer from 1 to 10>,
            "feedback": "<detailed feedback text>",
            "next_question": "<the next question to ask>",
            "finished": <boolean>
        }}
        
        Do not wrap in markdown or ```json.
        """

        try:
            response = generate_content_with_retry(
                self.client,
                self.model_id,
                prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Interview Flow",
            )
            
            import json
            import re
            cleaned = response.text.strip()
            cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.MULTILINE).strip()
            return json.loads(cleaned)
        except Exception as e:
            print(f"Error in interview flow generation: {e}")
            return {
                "score": 0,
                "feedback": "Error evaluating response, please proceed.",
                "next_question": f"Can you explain your experience related to {role}?",
                "finished": False
            }

# Initialize service
education_service = EducationService()
