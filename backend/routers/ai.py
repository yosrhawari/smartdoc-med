<<<<<<< HEAD
from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_session
from schemas import SymptomeInput
from services.ai_service import detect_specialite

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/predict")
def predict_specialite(data: SymptomeInput, session: Session = Depends(get_session)):

    specialite = detect_specialite(data.symptome, session)

    return {
        "symptome": data.symptome,
        "specialite": specialite
=======
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
            "nom": m.nom,
            "prenom": m.prenom,
            "email": user.email if user else None,
            "adresse": m.adresse,
            "tarif": m.tarif,
            "biographie": m.biographie
        })

    return {
        "symptome": data.symptome,
        "specialite": specialite_nom,
        "medecins": result
>>>>>>> 409a706604a097d37dec7af54589f99e5e528cc0
    }