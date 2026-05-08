from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import RendezVous, ProfilMedecin, User
from schemas import RendezVousCreate
from utils.role_checker import require_role

router = APIRouter(prefix="/rendezvous", tags=["RendezVous"])

# CREATE RDV
@router.post("/")
def create_rdv(
    data: RendezVousCreate,
    session: Session = Depends(get_session),
    user = Depends(require_role("PATIENT"))
):
    # Correction : user est un dict (payload JWT), on utilise .get("user_id")
    patient_id = user.get("user_id")
    
    new_rdv = RendezVous(
        patient_id=patient_id,
        medecin_id=data.medecin_id,
        date_rdv=data.date_rdv,
        heure=data.heure,
        statut="PREVU"
    )
    
    session.add(new_rdv)
    session.commit()
    session.refresh(new_rdv)
    return new_rdv

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

# GET PATIENT RDV WITH DOCTOR NAME
@router.get("/my-appointments")
def get_my_appointments(
    session: Session = Depends(get_session),
    user = Depends(require_role("PATIENT"))
):
    patient_id = user.get("user_id")
    
    statement = select(RendezVous, ProfilMedecin, User).join(
        ProfilMedecin, RendezVous.medecin_id == ProfilMedecin.id
    ).join(
        User, ProfilMedecin.user_id == User.id
    ).where(RendezVous.patient_id == patient_id)
    
    results = session.exec(statement).all()
    
    from models import Specialite

    return [
        {
            "id": rdv.id,
            "date_rdv": rdv.date_rdv,
            "heure": rdv.heure,
            "statut": rdv.statut,
            "doctor_name": f"Dr. {u.nom} {u.prenom}",
            "specialite": session.get(Specialite, pm.specialite_id).nom if pm.specialite_id else pm.spec_nom_temp,
            "adresse": pm.adresse,
            "medecin_id": rdv.medecin_id
        }
        for rdv, pm, u in results
    ]