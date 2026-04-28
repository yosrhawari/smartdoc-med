from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from models import Specialite

router = APIRouter(prefix="/specialites", tags=["Specialites"])


@router.get("/")
def get_all_specialites(session: Session = Depends(get_session)):

    specialites = session.exec(select(Specialite)).all()

    return [
        {
            "id": s.id,
            "nom": s.nom
        }
        for s in specialites
    ]