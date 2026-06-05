from google import genai
import os
from extensions import mongo
from datetime import datetime
from pypdf import PdfReader
from services.cerebras_service import cerebras_service
from services.gemini_utils import generate_content_with_retry

class MedicalService:
    def __init__(self):
        # Initialize Gemini using new google-genai SDK
        self.api_key = os.getenv('GEMINI_API_KEY')
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            # Using the version requested by user
            self.model_id = 'gemini-2.5-flash' 
            self.fallback_model_ids = [
                'gemini-2.5-flash-lite',
                'gemini-flash-lite-latest',
                'gemini-2.0-flash',
            ]
        else:
            self.client = None
            self.fallback_model_ids = []
            print("Warning: GEMINI_API_KEY not found. Medical Service LLM features will be disabled.")
            
        # RAG / Knowledge Base State
        self.knowledge_base_path = None
        self.knowledge_index = [] 
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Auto-loads valid PDF from data/knowledge_base and indexes it."""
        kb_dir = os.path.join(os.getcwd(), 'data', 'knowledge_base')
        if os.path.exists(kb_dir):
            files = [f for f in os.listdir(kb_dir) if f.lower().endswith('.pdf')]
            if files:
                self.knowledge_base_path = os.path.join(kb_dir, files[0])
                print(f"Medical Service: Loading Knowledge Base: {self.knowledge_base_path}...")
                
                try:
                    reader = PdfReader(self.knowledge_base_path)
                    for i, page in enumerate(reader.pages):
                        text = page.extract_text()
                        if text:
                            self.knowledge_index.append({"page": i+1, "text": text})
                    print(f"Knowledge Base Loaded. Indexed {len(self.knowledge_index)} pages.")
                except Exception as e:
                    print(f"Failed to index PDF: {e}")

    def _retrieve_context(self, query):
        """Simple RAG: Find the most relevant pages for the query."""
        if not self.knowledge_index or not query:
            return ""
        query_words = set(query.lower().split())
        scored_pages = []
        for entry in self.knowledge_index:
            score = 0
            page_text_lower = entry['text'].lower()
            for word in query_words:
                if word in page_text_lower: score += 1
            if score > 0: scored_pages.append((score, entry))
        scored_pages.sort(key=lambda x: x[0], reverse=True)
        top_results = scored_pages[:3]
        context_str = "\n\n".join([f"--- Page {x[1]['page']} ---\n{x[1]['text']}" for x in top_results])
        return context_str

    def _fallback_json_response(self, llama_advice=None, note=None):
        response = {
            "possibleCauses": ["Unable to complete Gemini synthesis right now."],
            "homeRemedies": ["Rest, hydrate, and monitor symptoms."],
            "redFlags": ["Seek urgent medical care if symptoms worsen or become severe."]
        }
        if llama_advice:
            response["llamaSummary"] = llama_advice
        if note:
            response["serviceNote"] = note
        return response

    def _fallback_guidance(self, condition, confidence, llama_analysis, note=None):
        note_line = (
            f"\n\n**Service note:** {note}"
            if note
            else ""
        )
        return (
            "This output is cross-verified by Roboflow and Llama 3.1. "
            "Gemini was temporarily unavailable, so this is a reduced-confidence fallback.\n\n"
            f"## Detected Finding\n- Condition: {condition}\n- Confidence: {confidence}%\n\n"
            f"## Llama Analysis\n{llama_analysis}\n\n"
            "## Safety Note\n"
            "If you have severe pain, trouble breathing, heavy bleeding, confusion, "
            "or rapidly worsening symptoms, seek urgent medical care immediately."
            f"{note_line}"
        )

    def consult_general_health(self, symptoms, language='en'):
        """
        Generates dual-model validated health advice.
        """
        if not self.client: return {"error": "AI Service unavailable"}

        book_context = self._retrieve_context(symptoms)
        prompt = f"""
        You are an AI Health Assistant & Senior Doctor.
        Patient Symptoms: "{symptoms}"
        Context: {book_context}
        
        Task: Provide structured advice in {language}.
        Format (JSON): {{ "possibleCauses": [], "homeRemedies": [], "redFlags": [] }}
        """

        try:
            # Dual Inference
            llama_advice = cerebras_service.generate_content(prompt, "You are a professional medical assistant.")
            
            synthesis_prompt = f"""
            System: Cross-verify these two medical perspectives.
            1. Llama Opinion: {llama_advice}
            2. Patient Query: {symptoms}
            
            Task: Using your superior medical reasoning, generate a final accurate JSON response in {language}.
            Output Format: JSON only.
            """

            response = generate_content_with_retry(
                self.client,
                self.model_id,
                synthesis_prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Medical consultation synthesis",
            )
            text = response.text.replace('```json', '').replace('```', '').strip()
            import json
            return json.loads(text)
        except Exception as e:
            print(f"Consult Error: {e}")
            return self._fallback_json_response(
                llama_advice=locals().get("llama_advice"),
                note=str(e),
            )

    def get_ai_guidance(self, condition, confidence, language='en', image_path=None, user_notes=''):
        """
        Implementing 3-Model Hybrid (Roboflow + Llama + Gemini) Cross-Verification.
        """
        if not self.client: return "AI Guidance unavailable."

        rag_context = self._retrieve_context(f"{condition} {user_notes}") if not image_path else ""

        llama_prompt = f"""
        Analyze this Medical Finding:
        - Detected Condition: {condition}
        - Confidence: {confidence}%
        - Patient Notes: {user_notes}
        
        Provide a technical medical assessment.
        """
        llama_analysis = cerebras_service.generate_content(llama_prompt, "You are a senior medical board examiner.")

        gemini_vision_prompt = f"""
        Analyze this medical scan. 
        Metadata suggests: {condition} ({confidence}% confidence).
        Patient Context: {user_notes}
        
        Does the image confirm this? Describe visual evidence.
        """
        
        contents = [gemini_vision_prompt]
        if image_path:
            try:
                import PIL.Image
                img = PIL.Image.open(image_path)
                contents.append(img)
            except Exception as e:
                print(f"Medical image load error: {e}")
                image_path = None

        try:
            gemini_vision_result = generate_content_with_retry(
                self.client,
                self.model_id,
                contents,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Medical vision analysis",
            ).text
        except Exception as e:
            print(f"Gemini vision fallback: {e}")
            gemini_vision_result = "Gemini vision analysis was temporarily unavailable."

        final_synthesis_prompt = f"""
        You are the Master Medical Architect. Cross-verify these findings:
        1. **Vision Engine Result**: {condition} ({confidence}%)
        2. **Llama 3.1 Analysis**: {llama_analysis}
        3. **Gemini Vision Evidence**: {gemini_vision_result}
        
        **Your Task:**
        Combine these into a single, high-reliability report for the patient in {language}.
        - Reconcile any contradictions.
        - Reference the Trusted Source if relevant: {rag_context}
        - Start with the disclaimer: "This output is cross-verified by 3 AI models (Roboflow, Llama 3.1, and Gemini) for maximum reliability. Not a substitute for professional diagnosis."
        
        Format in Clean Markdown ({language}).
        """
        
        try:
            final_report = generate_content_with_retry(
                self.client,
                self.model_id,
                final_synthesis_prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Medical guidance synthesis",
            )
            return final_report.text
        except Exception as e:
            print(f"Medical guidance synthesis fallback: {e}")
            return self._fallback_guidance(condition, confidence, llama_analysis, note=str(e))

# Initialize service
medical_service = MedicalService()
