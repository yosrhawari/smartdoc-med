from sqlmodel import Session, select
from models import Specialite 
import requests
API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
HEADERS = {"Authorization": "Bearer YOUR_TOKEN"}


cache = {}
def clear_cache():
    cache.clear()
def detect_specialite(symptome: str, session):

    symptome = symptome.lower().strip()
    if symptome in cache:
        print(" Cache utilisé")
        return cache[symptome]
    # récupérer spécialités depuis DB
    specialites_db = session.exec(select(Specialite)).all()
    labels = [s.nom for s in specialites_db]

    # fallback
    if not labels:
        labels = ["Médecin généraliste"]

    try:
        payload = {
            "inputs": symptome,
            "parameters": {
                "candidate_labels": labels
            }
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload)
        result = response.json()

        if "labels" not in result or len(result["labels"]) == 0:
            specialite = "Médecin généraliste"
        else:
            specialite = result["labels"][0]

        cache[symptome] = specialite

        return specialite

    except Exception as e:
        print("Erreur IA:", e)
        return "Médecin généraliste"