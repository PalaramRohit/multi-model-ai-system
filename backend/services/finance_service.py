import csv
import json
import os
import re
from google import genai
from datetime import datetime


from services.cerebras_service import cerebras_service
from services.gemini_utils import generate_content_with_retry

class FinanceService:
    def __init__(self):
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

    def parse_transactions(self, file_path):
        """Parses the transactions CSV."""
        try:
            transactions = []
            with open(file_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Clean and format Date
                    if 'Date' in row and row['Date']:
                        try:
                            date_str = row['Date'].strip()
                            for fmt in ('%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d'):
                                try:
                                    dt = datetime.strptime(date_str, fmt)
                                    row['Date'] = dt.strftime('%Y-%m-%d')
                                    break
                                except ValueError:
                                    continue
                        except Exception:
                            pass
                    
                    # Clean and format Amount
                    if 'Amount' in row and row['Amount']:
                        try:
                            amt_str = re.sub(r'[\$,]', '', row['Amount'])
                            row['Amount'] = float(amt_str)
                        except ValueError:
                            row['Amount'] = 0.0
                    elif 'Amount' in row:
                        row['Amount'] = 0.0
                    
                    transactions.append(row)
            return transactions
        except Exception as e:
            raise ValueError(f"Error parsing transactions: {e}")

    def parse_budget(self, file_path):
        """Parses the budget CSV."""
        try:
            budget = []
            with open(file_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if 'Budget' in row and row['Budget']:
                        try:
                            b_str = re.sub(r'[\$,]', '', row['Budget'])
                            row['Budget'] = float(b_str)
                        except ValueError:
                            row['Budget'] = 0.0
                    elif 'Budget' in row:
                        row['Budget'] = 0.0
                    budget.append(row)
            return budget
        except Exception as e:
            raise ValueError(f"Error parsing budget: {e}")

    def generate_report(self, transaction_file_path, budget_file_path=None, language='en', user_goals=''):
        """
        Hybrid Financial Advisor (Llama + Gemini).
        """
        try:
            transactions = self.parse_transactions(transaction_file_path)
            
            # Filtering spending_summary (type == debit)
            spending_summary = [
                row for row in transactions 
                if row.get('Transaction Type', '').strip().lower() == 'debit'
            ]
            
            # Grouping by Category
            cat_amounts = {}
            for row in spending_summary:
                cat = row.get('Category', 'Unknown').strip()
                if not cat:
                    cat = 'Unknown'
                amt = row.get('Amount', 0.0)
                cat_amounts[cat] = cat_amounts.get(cat, 0.0) + amt
            
            cat_summary = [
                {'Category': cat, 'Amount': amt} 
                for cat, amt in cat_amounts.items()
            ]

            budget_data_str = ""
            if budget_file_path:
                budget_rows = self.parse_budget(budget_file_path)
                
                # Perform outer join on Category
                merged_map = {}
                for row in budget_rows:
                    cat = row.get('Category', '').strip()
                    if cat:
                        limit = row.get('Budget', 0.0)
                        merged_map[cat] = {'Category': cat, 'Actual': 0.0, 'Limit': limit}
                
                for row in cat_summary:
                    cat = row.get('Category', '').strip()
                    actual = row.get('Amount', 0.0)
                    if cat:
                        if cat in merged_map:
                            merged_map[cat]['Actual'] = actual
                        else:
                            merged_map[cat] = {'Category': cat, 'Actual': actual, 'Limit': 0.0}
                
                merged = list(merged_map.values())
                for row in merged:
                    row['Variance'] = row['Limit'] - row['Actual']
                
                budget_data_str = json.dumps(merged, indent=2)
            else:
                budget_data_str = json.dumps(cat_summary, indent=2)

            # 1. Llama Analysis
            llama_prompt = f"Analyze this financial data: {budget_data_str}. Goal: {user_goals}"
            llama_analysis = cerebras_service.generate_content(llama_prompt, "You are a senior financial auditor.")

            # 2. Gemini Synthesis
            if not self.client: return f"Llama analysis complete: {llama_analysis}"
            
            synthesis_prompt = f"""
            You are the Master Wealth Advisor. 
            Auditor Perspective (Llama): {llama_analysis}
            Data: {budget_data_str}
            User Goal: {user_goals}
            
            Provide a consolidated, professional financial report in {language}.
            Include budget health check, trends, and actionable advice.
            *This output is cross-verified by Llama 3.1 and Gemini.*
            """
            
            response = generate_content_with_retry(
                self.client,
                self.model_id,
                synthesis_prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Finance report synthesis",
            )
            return response.text

        except Exception as e:
            return (
                f"Report Generation Failed: {str(e)}\n\n"
                f"Llama analysis fallback:\n{llama_analysis}"
                if 'llama_analysis' in locals()
                else f"Report Generation Failed: {str(e)}"
            )

    def predict_hospital_bill(self, data):
        """
        Calculates estimated medical costs with hybrid AI reasoning.
        """
        try:
            # Basic variables
            treatment = data.get('treatment', 'General')
            num_days = int(data.get('days', 1))
            icu_days = int(data.get('icu_days', 0))
            surgery_req = data.get('surgery', 'No')
            city_tier = data.get('city', 'Tier 1')
            hospital_type = data.get('hospital_type', 'Private')
            insurance_cover = float(data.get('insurance', 0))

            # Logic constants
            base_rates = {
                'Cardiac Surgery': {'room': 3000, 'icu': 8000, 'surgery': 150000, 'prof': 50000},
                'Orthopedic': {'room': 2500, 'icu': 6000, 'surgery': 80000, 'prof': 30000},
                'General Surgery': {'room': 2000, 'icu': 5000, 'surgery': 50000, 'prof': 20000},
                'Maternity': {'room': 3500, 'icu': 7000, 'surgery': 40000, 'prof': 25000},
                'General': {'room': 1500, 'icu': 4000, 'surgery': 0, 'prof': 5000}
            }
            rates = base_rates.get(treatment, base_rates['General'])

            # Multipliers
            city_mult = 1.5 if city_tier == 'Tier 1' else 1.2 if city_tier == 'Tier 2' else 1.0
            hosp_mult = 2.0 if hospital_type == 'Super Specialty' else 1.4 if hospital_type == 'Private' else 0.8
            inflation_factor = 1.15

            # Calculations
            room_cost = {'min': rates['room'] * num_days * city_mult * hosp_mult, 'max': (rates['room'] + 1000) * num_days * city_mult * hosp_mult}
            icu_cost = {'min': rates['icu'] * icu_days * city_mult * hosp_mult, 'max': (rates['icu'] + 2000) * icu_days * city_mult * hosp_mult}
            surg_cost = {'min': rates['surgery'] * city_mult * hosp_mult, 'max': (rates['surgery'] * 1.3) * city_mult * hosp_mult}
            prof_cost = {'min': rates['prof'] * city_mult * hosp_mult, 'max': (rates['prof'] * 1.5) * city_mult * hosp_mult}

            pharmacy_min = (room_cost['min'] + icu_cost['min'] + surg_cost['min']) * 0.15
            pharmacy_max = (room_cost['max'] + icu_cost['max'] + surg_cost['max']) * 0.25
            
            lab_min = (room_cost['min'] + icu_cost['min']) * 0.1
            lab_max = (room_cost['max'] + icu_cost['max']) * 0.2

            total_min = (room_cost['min'] + icu_cost['min'] + surg_cost['min'] + prof_cost['min'] + pharmacy_min + lab_min) * inflation_factor
            total_max = (room_cost['max'] + icu_cost['max'] + surg_cost['max'] + prof_cost['max'] + pharmacy_max + lab_max) * inflation_factor

            payable_min = max(0, total_min - insurance_cover)
            payable_max = max(0, total_max - insurance_cover)

            # 7. Hybrid Analysis (Llama + Gemini Synthesis)
            summary_data = {
                "estimated_range": f"{round(total_min)} - {round(total_max)}",
                "net_payable": f"{round(payable_min)} - {round(payable_max)}",
                "breakdown": {k: f"{v['min']} - {v['max']}" for k, v in {
                    "Room": room_cost, "ICU": icu_cost, "Surgery": surg_cost, 
                    "Fees": prof_cost, "Pharmacy": {"min": round(pharmacy_min), "max": round(pharmacy_max)},
                    "Labs": {"min": round(lab_min), "max": round(lab_max)}
                }.items()}
            }

            llama_prompt = f"Audit this hospital bill prediction: {json.dumps(summary_data)}"
            llama_audit = cerebras_service.generate_content(llama_prompt, "You are a medical insurance auditor.")

            synthesis_prompt = f"""
            You are the Senior Financial Health Auditor.
            Llama Audit: {llama_audit}
            Calculated Data: {json.dumps(summary_data)}
            
            Provide a final human-readable explanation of these costs. 
            Confirm if the calculations are reasonable.
            *This output is cross-verified by Llama 3.1 and Gemini.*
            """
            
            ai_explanation = generate_content_with_retry(
                self.client,
                self.model_id,
                synthesis_prompt,
                fallback_model_ids=self.fallback_model_ids,
                operation_name="Hospital bill synthesis",
            ).text

            return {
                "data": summary_data,
                "ai_explanation": ai_explanation
            }

        except Exception as e:
            return {'error': str(e)}

# Initialize
finance_service = FinanceService()
