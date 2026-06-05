from google import genai
import os
import json
from extensions import mongo
from datetime import datetime
from services.gemini_utils import generate_content_with_retry


class BillingService:
    def __init__(self):
        # Initialize Gemini using new google-genai SDK
        self.api_key = os.getenv('GEMINI_API_KEY')
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
            # using 2.5 flash as per project standard
            self.model_id = 'gemini-2.5-flash'
            self.fallback_model_ids = [
                'gemini-2.5-flash-lite',
                'gemini-flash-lite-latest',
                'gemini-2.0-flash',
            ]
        else:
            self.client = None
            self.fallback_model_ids = []
            print("Warning: GEMINI_API_KEY not found. Billing Service LLM features will be disabled.")

    def analyze_billing_scenario(self, hospital_name, city, room_type, admission_reason, duration='3', age='30', treatment_type='Medical Management', tier='Tier-1', gender='Male', icu_days='0', surgery_complexity='Medium', emergency='false', implant='false', network_hospital='true', policy_path=None):
        """
        Analyzes a medical billing scenario against an insurance policy.
        """
        if not self.client:
            return {"error": "AI Service Unavailable"}

        # Construct the Scenario Description
        scenario = f"""
        **Hospitalization Scenario:**
        - **Hospital:** {hospital_name}
        - **City:** {city}
        - **Selected Room Type:** {room_type}
        - **Reason for Admission:** {admission_reason}
        - **Duration of Stay:** {duration} Days (ICU: {icu_days} Days)
        - **Patient Age:** {age} Years | **Gender:** {gender}
        - **Treatment Category:** {treatment_type}
        - **Hospital Tier:** {tier} | **Network Hospital:** {network_hospital}
        - **Surgery Complexity:** {surgery_complexity}
        - **Emergency Admission:** {emergency}
        - **Implants Required:** {implant}
        """

        prompt = f"""
        You are an Expert Medical Insurance Surveyor and Hospital Bill Auditor in India.
        
        {scenario}
        
        **Your Task:**
        1. **Analyze the Policy**: Read the attached Insurance Policy document (if provided). Look for:
           - Room Rent Capping (e.g., "1% of Sum Insured" or "Single Private Room").
           - Copayment clauses.
           - Specific exclusions for {admission_reason}.
        
        2. **Estimate the Bill**: Based on your knowledge of medical costs in {city} for {hospital_name} (or similar tier hospitals), **ESTIMATE** the likely total bill for this treatment.
        
        3. **Calculate Coverage**: Apply the policy rules to the estimated bill.
           - If no policy is provided, assume "No Insurance" (Total Bill = Patient Pay).
           - If policy is provided, calculate: Total Bill - Insurance Payout = Patient Pay.
           
        4. **Provide a Breakdown**: Return the result ONLY in the following JSON format:
        {{
            "estimated_total_bill": 150000,
            "insurance_coverage": 120000,
            "patient_payable": 30000,
            "breakdown": [
                {{"item": "Room Rent (5 days)", "cost": 25000, "covered": 20000, "note": "Policy cap is 4000/day"}},
                {{"item": "Surgery/Procedure", "cost": 100000, "covered": 100000, "note": "Fully covered"}}
            ],
            "key_policy_limitations": ["Room Rent capped at 1% of SI", "Co-pay 10%"],
            "recommendation": "Consider upgrading room type only if you are willing to pay the difference."
        }}
        
        **Important:** 
        - Be realistic with Indian hospital pricing. 
        - If the policy text is blurry or unclear, make a conservative estimate and mention it in notes.
        - Return **ONLY JSON**. No markdown.
        """
        
        try:
            content_parts = [prompt]
            
            if policy_path:
                print(f"Uploading file to Gemini: {policy_path}")
                # Use Gemini File API which supports PDF and Images
                uploaded_file = self.client.files.upload(path=policy_path)
                
                # Append uploaded file to content_parts
                content_parts.append(uploaded_file)
                print("File uploaded successfully.")

            response = generate_content_with_retry(
                self.client,
                self.model_id,
                content_parts,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Billing analysis",
            )
            
            # Clean response to ensure valid JSON
            text = response.text.replace('```json', '').replace('```', '').strip()
            
            # Additional clean up for common json errors
            if text.startswith('json'):
                 text = text[4:].strip()
                 
            try:
                return json.loads(text)
            except json.JSONDecodeError as json_err:
                print(f"JSON Parse Error: {json_err}. Raw text: {text}")
                # Fallback
                return {
                    "estimated_total_bill": 0,
                    "insurance_coverage": 0,
                    "patient_payable": 0,
                    "breakdown": [],
                    "key_policy_limitations": ["AI Error: Could not parse response."],
                    "recommendation": "Please try again or upload a clearer document."
                }

        except Exception as e:
            print(f"Billing Analysis Error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "error": "Analysis Failed", 
                "details": str(e),
                "estimated_total_bill": 0,
                "insurance_coverage": 0,
                "patient_payable": 0,
                "breakdown": [],
                "key_policy_limitations": [f"System Error: {str(e)}"],
                "recommendation": "Technical error occurred during processing."
            }

# Initialize service
billing_service = BillingService()
