from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session,select

from database import get_session
from models import ProfilMedecin, User,ProfilMedecin, RendezVous, Review,Specialite

from utils.role_checker import require_role
from services.ai_service import clear_cache
router = APIRouter(prefix="/admin", tags=["admin"])

@router.put("/medecins/{id}/validate")
def validate_medecin(
    id: int,
    session: Session = Depends(get_session),
    user_admin = Depends(require_role("ADMIN"))
):

    med = session.get(ProfilMedecin, id)

    if not med:
        raise HTTPException(status_code=404, detail="Medecin not found")

    # njibo user
    user = session.get(User, med.user_id)

    if user:
        med.nom = user.nom
        med.prenom = user.prenom

    n_specialite = med.spec_nom_temp

    specialite = session.exec(
        select(Specialite).where(Specialite.nom == n_specialite)
    ).first()

    if not specialite:
        specialite = Specialite(nom=n_specialite, mots_cles="")
        session.add(specialite)
        session.commit()
        session.refresh(specialite)

    med.specialite_id = specialite.id
    med.statut_validation = "VALIDE"

    session.add(med)
    session.commit()

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
@router.get("/users")
def get_all_users(
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    users = session.exec(select(User)).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "nom": u.nom,
            "prenom": u.prenom
        }
        for u in users
    ]
from sqlmodel import select

@router.get("/pending")
def get_pending_medecins(session: Session = Depends(get_session)):
    # join f blast loop 
    statement = select(ProfilMedecin, User).join(User, ProfilMedecin.user_id == User.id).where(
        ProfilMedecin.statut_validation == "EN_ATTENTE"
    )
    results = session.exec(statement).all()

    final_result = []
    for med, user in results:
        final_result.append({
            "id": med.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "adresse": med.adresse,
            "tarif": med.tarif,
            "image": med.image,
            "specialite": med.spec_nom_temp
        })

    return final_result