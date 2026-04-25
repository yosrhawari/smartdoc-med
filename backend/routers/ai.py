from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session,select
from database import get_session
from services.ai_service import detect_specialite
from models import ProfilMedecin, User,ProfilMedecin, RendezVous, Review,Specialite
from schemas import SymptomeInput

router = APIRouter(prefix="/ai", tags=["AI"])
@router.post("/predict")
def predict(data: SymptomeInput, session: Session = Depends(get_session)):

    # 🔥 1. detect specialite
    specialite_nom = detect_specialite(data.symptome, session)

    # 🔥 2. trouver id specialite
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    if not specialite:
        return {
            "specialite": specialite_nom,
            "medecins": []
        }

    # 🔥 3. récupérer médecins validés
    medecins = session.exec(
        select(ProfilMedecin).where(
            (ProfilMedecin.specialite_id == specialite.id) &
            (ProfilMedecin.statut_validation == "VALIDE")
        )
    ).all()

    # 🔥 4. récupérer info user
    result = []
    for m in medecins:
        user = session.exec(
            select(User).where(User.id == m.user_id)
        ).first()

        result.append({
            "id": m.id,
            "email": user.email if user else None,
            "adresse": m.adresse,
            "tarif": m.tarif,
            "biographie": m.biographie
        })

    return {
        "symptome": data.symptome,
        "specialite": specialite_nom,
        "medecins": result
    }