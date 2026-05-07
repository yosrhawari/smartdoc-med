import os
import requests
import json
from dotenv import load_dotenv
from sqlmodel import Session, select
from models import Specialite

load_dotenv()

class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.url = os.getenv("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions")
        self.model = os.getenv("MODEL_NAME", "openai/gpt-4o-mini")

    def _call_ai(self, system_prompt, user_prompt, temperature=0.7):
        if not self.api_key:
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "SmartDoc Med"
        }

        payload = {
            "model": self.model,
            "temperature": temperature,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        }

        try:
            response = requests.post(self.url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        except Exception as e:
            print(f"AI Service Error: {e}")
            return None

    def recommend_specialty(self, data: dict, specialties: list[Specialite]):
        specs_list = "\n".join([f"{s.id}: {s.nom}" for s in specialties])
        
        system_prompt = "You return only the numerical ID of the specialty."
        user_prompt = f"""
You are an expert medical triage assistant.
Your task is to recommend the MOST appropriate medical specialty for a patient.
You MUST choose exactly ONE specialty from the provided list.

Patient Data:
- Age Group: {data.get('patient_info', {}).get('ageGroup')}
- Gender: {data.get('patient_info', {}).get('gender')}
- Primary Symptoms: {data.get('symptoms')}
- Affected Area: {data.get('area')}
- Duration: {data.get('duration')}
- Severity (1-10): {data.get('severity')}

Available Specialties:
{specs_list}

Respond ONLY with the numerical ID of the best specialty. No explanation, no text, just the number.
"""
        response = self._call_ai(system_prompt, user_prompt, temperature=0)
        if response:
            try:
                # Extract number using regex if needed, but the prompt is strict
                import re
                match = re.search(r'\d+', response)
                return int(match.group()) if match else None
            except ValueError:
                return None
        return None

    def generate_bio(self, specialty, skills, experience, achievements):
        system_prompt = "You are a professional medical copywriter."
        user_prompt = f"""
Write a compelling, empathetic, and professional biography for a doctor.

Doctor Information:
- Specialty: {specialty}
- Key Skills: {skills}
- Experience: {experience}
- Achievements: {achievements}

Guidelines:
1. Write in the third person.
2. Keep it between 3 and 5 sentences.
3. Highlight expertise and commitment to patient care.
4. Do NOT include placeholders.

Respond with the paragraph ONLY.
"""
        return self._call_ai(system_prompt, user_prompt)

    def summarize_health_history(self, patient_name, history_data):
        system_prompt = "You are a professional medical health summarizer."
        user_prompt = f"""
Provide a brief, encouraging health summary for {patient_name} based on their recent medical visits.

Medical Records:
{history_data}

Guidelines:
1. Summarize general health status.
2. Mention focus of treatment if medications exist.
3. Provide 1-2 encouraging next steps.
4. Total length: 2-3 sentences.

Respond with the summary ONLY.
"""
        return self._call_ai(system_prompt, user_prompt)

    def summarize_bio_points(self, bio):
        system_prompt = "You summarize doctor bios into 3-4 HTML bullet points."
        user_prompt = f"""
Summarize the following doctor biography into 3-4 concise bullet points.

Doctor Biography:
{bio}

Guidelines:
1. Focus on experience, expertise, and patient approach.
2. Use professional yet accessible language.
3. Use HTML <li> tags.

Respond with the bullet points ONLY (wrapped in <li> tags).
"""
        return self._call_ai(system_prompt, user_prompt, temperature=0.5)

# Singleton instance
ai_service = AIService()