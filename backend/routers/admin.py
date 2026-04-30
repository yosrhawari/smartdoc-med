from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session,select

from database import get_session
from models import ProfilMedecin, User,ProfilMedecin, RendezVous, Review,Specialite

from utils.role_checker import require_role
from services.ai_service import clear_cache
router = APIRouter(prefix="/admin", tags=["admin"])

@router.put("/medecins/{email}/validate")
def validate_medecin(
    email:str,
    session: Session = Depends(get_session),
    user = Depends(require_role("ADMIN"))
):
   # 🔹 1. récupérer user
    db_user = session.exec(
        select(User).where(User.email == email)
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.role != "MEDECIN":
        raise HTTPException(status_code=400, detail="User is not a medecin")

    # 🔹 2. récupérer profil medecin
    med = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == db_user.id)
    ).first()

    if not med:
        raise HTTPException(status_code=404, detail="Profil medecin not found")
    n_specialite=med.spec_nom_temp



    # 🔹 3. vérifier / créer spécialité
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == n_specialite)
    ).first()

    if not specialite:
        specialite = Specialite(
            nom=n_specialite,
            mots_cles=""
        )
        session.add(specialite)
        session.commit()
        session.refresh(specialite)

    # ✅ assigner spécialité
    med.specialite_id = specialite.id
    med.statut_validation = "VALIDE"

    session.add(med)
    session.commit()

    # 🔥 clear cache IA
    clear_cache()

    return {"message": "Medecin validé avec spécialité"}

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
@router.get("/users")
def get_all_users(
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    users = session.exec(
        select(User).where(
            (User.role == "PATIENT")
        )
    ).all()
    return [
        {
            "email": u.email,
            "role": u.role
        }
        for u in users
    ]