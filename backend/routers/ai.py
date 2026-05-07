from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from database import get_session
from services.ai_service import ai_service
from models import ProfilMedecin, User, Specialite
from schemas import SymptomeInput

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/predict")
def predict(data: SymptomeInput, session: Session = Depends(get_session)):
    # 1. Fetch all specialties from DB
    specialties = session.exec(select(Specialite)).all()
    
    if not specialties:
        raise HTTPException(status_code=404, detail="No specialties found in database")

    # 2. Ask AI to recommend a specialty ID
    # Convert data model to dict for service
    assessment_data = data.model_dump()
    specialty_id = ai_service.recommend_specialty(assessment_data, specialties)

    if not specialty_id:
        # Fallback to a general specialty if AI fails
        specialty = specialties[0] 
        specialty_nom = specialty.nom
    else:
        specialty = session.get(Specialite, specialty_id)
        if not specialty:
            # If AI returns an invalid ID, fallback
            specialty = specialties[0]
        specialty_nom = specialty.nom

    # 3. Find doctors for this specialty
    medecins = session.exec(
        select(ProfilMedecin).where(
            (ProfilMedecin.specialite_id == specialty.id) &
            (ProfilMedecin.statut_validation == "VALIDE")
        )
    ).all()

    # 4. Format response
    result = []
    for m in medecins:
        user = session.get(User, m.user_id)
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
        "symptomes": data.symptoms,
        "specialite": specialty_nom,
        "doctors": result,
        "ai_analysis": {
            "specialite": specialty_nom,
            "confidence": "High"
        }
    }