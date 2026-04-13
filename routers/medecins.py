from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import ProfilMedecin
from schemas import MedecinCreate
from services.matching_service import find_medecins_by_symptome
from services.medecin_service import get_medecins_with_rating
from services.matching_service import find_medecins_advanced


router = APIRouter(prefix="/medecins", tags=["Medecins"])

# CREATE MEDECIN
@router.post("/")
def create_medecin(med: MedecinCreate, session: Session = Depends(get_session)):
    db_med = ProfilMedecin(**med.dict())
    session.add(db_med)
    session.commit()
    session.refresh(db_med)
    return db_med

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