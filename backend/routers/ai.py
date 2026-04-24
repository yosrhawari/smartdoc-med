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
    }