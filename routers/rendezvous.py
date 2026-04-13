from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import RendezVous
from schemas import RendezVousCreate
from utils.role_checker import require_role

router = APIRouter(prefix="/rendezvous", tags=["RendezVous"])

# CREATE RDV
@router.post("/")
def create_rdv(
    data: RendezVous,
    session: Session = Depends(get_session),
    user = Depends(require_role("PATIENT"))
):
    data.patient_id = user.id
    session.add(data)
    session.commit()
    session.refresh(data)
    return data

@router.put("/{id}/status")
def update_status(
    id: int,
    status: str,
    session: Session = Depends(get_session)
):
    rdv = session.get(RendezVous, id)

    if not rdv:
        raise HTTPException(status_code=404)

    rdv.statut = status
    session.add(rdv)
    session.commit()

    return {"message": "updated"}
# GET ALL RDV
@router.get("/")
def get_rdv(session: Session = Depends(get_session)):
    return session.exec(select(RendezVous)).all()