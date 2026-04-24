from sqlmodel import Session, select
from models import Specialite
import requests

API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
HEADERS = {"Authorization": "Bearer YOUR_TOKEN"}

cache = {}

def clear_cache():
    cache.clear()


def detect_specialite(symptome: str, session: Session):

    # 🔹 nettoyage input
    symptome = symptome.lower().strip()

    # 🔹 cache
    if symptome in cache:
        print("✅ Cache utilisé")
        return cache[symptome]

    # 🔹 récupérer spécialités
    specialites_db = session.exec(select(Specialite)).all()

    labels = [
        f"médecin spécialiste en {s.nom}"
        for s in specialites_db
    ]

    # 🔹 fallback si DB vide
    if not labels:
        return "Médecin généraliste"

    try:
        payload = {
            "inputs": symptome,
            "parameters": {
                "candidate_labels": labels
            }
        }

        response = requests.post(API_URL, headers=HEADERS, json=payload)
        result = response.json()

        # 🔴 sécurité API
        if "labels" not in result or len(result["labels"]) == 0:
            specialite = "Médecin généraliste"
        else:
            # 🔥 récupérer meilleur label
            specialite_raw = result["labels"][0]

            # 🔥 nettoyer phrase → garder seulement spécialité
            specialite = specialite_raw.replace(
                "médecin spécialiste en", ""
            ).strip()

        # 🔹 cache
        cache[symptome] = specialite

        return specialite

    except Exception as e:
        print("❌ Erreur IA:", e)
        return "Médecin généraliste"