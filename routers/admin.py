from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session,select

from database import get_session
from models import ProfilMedecin, User,ProfilMedecin, RendezVous, Review

from utils.role_checker import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.put("/medecins/{id}/validate")
def validate_medecin(
    id: int,
    session: Session = Depends(get_session),
    user = Depends(require_role("ADMIN"))
):
    medecin = session.get(ProfilMedecin, id)

    if not medecin:
        raise HTTPException(status_code=404, detail="Medecin not found")

    medecin.statut_validation = "VALIDE"
    session.add(medecin)
    session.commit()
    session.refresh(medecin)

    return {"message": "Medecin validé"}

@router.get("/stats")
def get_stats(
    session: Session = Depends(get_session),
    user = Depends(require_role("ADMIN"))
):
    # Users
    total_users = len(session.exec(select(User)).all())

    # Doctors
    total_medecins = len(session.exec(select(ProfilMedecin)).all())

    medecins_valides = len(session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "VALIDE")
    ).all())

    medecins_attente = len(session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "EN_ATTENTE")
    ).all())

    # RDV
    total_rdv = len(session.exec(select(RendezVous)).all())

    # Reviews
    total_reviews = len(session.exec(select(Review)).all())

    return {
        "users": total_users,
        "medecins": {
            "total": total_medecins,
            "valides": medecins_valides,
            "en_attente": medecins_attente
        },
        "rendezvous": total_rdv,
        "reviews": total_reviews
    }