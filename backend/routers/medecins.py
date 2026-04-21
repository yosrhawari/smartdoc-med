from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import ProfilMedecin,Specialite
from schemas import MedecinCreate
from services.matching_service import find_medecins_by_symptome
from services.medecin_service import get_medecins_with_rating
from services.matching_service import find_medecins_advanced
from services.ai_service import detect_specialite
from services.score_service import compute_score


router = APIRouter(prefix="/medecins", tags=["Medecins"])

# CREATE MEDECIN
from models import Specialite
from sqlmodel import select


@router.post("/create")
def create_medecin(data: dict, session: Session = Depends(get_session)):

    specialite_nom = data.get("specialite_nom")

    # chercher si spécialité existe
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    #  ne pas créer maintenant → attendre validation admin
    med = ProfilMedecin(
        user_id=data["user_id"],
        adresse=data["adresse"],
        tarif=data["tarif"],
        specialite_id=None  # sera ajouté plus tard
    )

    #  stocker temporairement dans mémoire (ou payload)
    med._specialite_nom = specialite_nom  #  hack temporaire

    session.add(med)
    session.commit()

    return med

# GET ALL MEDECINS (VALIDES SEULEMENT)
@router.get("/")
def get_medecins(session: Session = Depends(get_session)):
    statement = select(ProfilMedecin).where(
        ProfilMedecin.statut_validation == "VALIDE"
    )
    return session.exec(statement).all()
#find medecin by symptome
@router.get("/search")
def search_medecins(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_by_symptome(symptome, session)
#get medecinsz with rating
@router.get("/with-rating")
def medecins_with_rating(session: Session = Depends(get_session)):
    return get_medecins_with_rating(session)

@router.get("/smart-search")
def smart_search(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_advanced(symptome, session)



@router.get("/ai-smart-search")
def ai_smart_search(symptome: str, session: Session = Depends(get_session)):

    # 1️⃣ IA → détecter spécialité
    specialite_nom = detect_specialite(symptome, session)

    # 2️⃣ récupérer spécialité DB
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    # 🔥 fallback si spécialité introuvable
    if not specialite:
        specialite = session.exec(
            select(Specialite).where(Specialite.nom == "Médecin généraliste")
        ).first()

        if not specialite:
            return {"message": "Aucune spécialité trouvée"}

    # 3️⃣ récupérer médecins validés
    medecins = session.exec(
        select(ProfilMedecin).where(
            ProfilMedecin.specialite_id == specialite.id,
            ProfilMedecin.statut_validation == "VALIDE"
        )
    ).all()

    # 4️⃣ scoring
    results = []

    for med in medecins:
        note = compute_score(med, session)

        results.append({
            "medecin_id": med.id,
            "adresse": med.adresse,
            "note": note
        })

    # 5️⃣ tri
    results.sort(key=lambda x: x["note"], reverse=True)

    return {
        "specialite_detected": specialite_nom,
        "medecins": results
    }