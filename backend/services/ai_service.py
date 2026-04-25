from sqlmodel import Session, select
from models import Specialite
import requests

# 🔥 modèle HuggingFace (gratuit)
API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"

# 🔥 cache pour performance
cache = {}

def clear_cache():
    cache.clear()


def detect_specialite(symptome: str, session: Session):

    symptome = symptome.lower().strip()

    # 🔹 cache
    if symptome in cache:
        print("Cache utilisé")
        return cache[symptome]
    # ❤️ Cardiologie
    if "coeur" in symptome or "cardiaque" in symptome or "poitrine" in symptome or "palpitations" in symptome:
        return "Cardiologie"

    # 🧴 Dermatologie
    if "peau" in symptome or "acné" in symptome or "bouton" in symptome or "eczéma" in symptome or "démangeaison" in symptome:
        return "Dermatologie"

    # 🧠 Neurologie
    if "tête" in symptome or "migraine" in symptome or "vertige" in symptome or "nerf" in symptome or "paralysie" in symptome:
        return "Neurologie"

    # 🧘 Psychiatrie
    if "stress" in symptome or "anxiété" in symptome or "dépression" in symptome or "insomnie" in symptome:
        return "Psychiatrie"

    # 👶 Pédiatrie
    if "enfant" in symptome or "bébé" in symptome or "nourrisson" in symptome:
        return "Pédiatrie"

    # 🫁 Pneumologie
    if "toux" in symptome or "respiration" in symptome or "essoufflement" in symptome or "asthme" in symptome:
        return "Pneumologie"

    # 🍽️ Gastro-entérologie
    if "ventre" in symptome or "estomac" in symptome or "digestion" in symptome or "diarrhée" in symptome or "vomissement" in symptome:
        return "Gastro-entérologie"

    # 🦴 Orthopédie
    if "os" in symptome or "fracture" in symptome or "genou" in symptome or "dos" in symptome or "articulation" in symptome:
        return "Orthopédie"

    # 👁️ Ophtalmologie
    if "oeil" in symptome or "vision" in symptome or "vue" in symptome or "flou" in symptome:
        return "Ophtalmologie"

    # 👂 ORL
    if "oreille" in symptome or "nez" in symptome or "gorge" in symptome or "sinus" in symptome:
        return "ORL"

    # 🧪 Endocrinologie
    if "diabète" in symptome or "hormone" in symptome or "thyroïde" in symptome:
        return "Endocrinologie"

    # 💧 Néphrologie
    if "rein" in symptome or "urine" in symptome or "urinaire" in symptome:
        return "Néphrologie"
    # 🦷 Dentisterie
    if "dent" in symptome or "gencive" in symptome or "carie" in symptome:
        return "Dentisterie"
    # 🧬 Hématologie
    if "sang" in symptome or "anémie" in symptome or "saignement" in symptome:
        return "Hématologie"

    # 🧑‍⚕️ Oncologie
    if "cancer" in symptome or "tumeur" in symptome or "masse" in symptome:
        return "Oncologie"

    # 🤰 Gynécologie
    if "règles" in symptome or "grossesse" in symptome or "utérus" in symptome or "ovaire" in symptome:
        return "Gynécologie"

    # =========================
    # 🔹 2. IA (HuggingFace)
    # =========================
    specialites_db = session.exec(select(Specialite)).all()
    labels = [s.nom for s in specialites_db]

    if not labels:
        return "Médecin généraliste"

    try:
        payload = {
            "inputs": f"Patient décrit ses symptômes: {symptome}",
            "parameters": {
                "candidate_labels": labels
            }
        }

        response = requests.post(API_URL, json=payload)
        result = response.json()

        print(" AI RESULT:", result)

        if "labels" in result and len(result["labels"]) > 0:
            specialite = result["labels"][0]
        else:
            specialite = "Médecin généraliste"

        # 🔹 cache
        cache[symptome] = specialite

        return specialite

    except Exception as e:
        print(" Erreur IA:", e)
        return "Médecin généraliste"