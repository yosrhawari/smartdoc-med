from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import RendezVous, ProfilMedecin, Specialite
from schemas import RendezVousCreate
from utils.role_checker import require_role
from utils.dependencies import get_current_user
router = APIRouter(prefix="/rendezvous", tags=["RendezVous"])
from datetime import date, time
# CREATE RDV
@router.post("/create")
def create_rdv(
    data: RendezVousCreate,
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):

    # vérifier disponibilité
    existing = session.exec(
        select(RendezVous).where(
            (RendezVous.medecin_id == data.medecin_id) &
            (RendezVous.date == data.date) &
            (RendezVous.heure == data.heure) &
            (RendezVous.statut != "ANNULE") &
            (RendezVous.statut != "REFUSE")
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Ce créneau est déjà réservé.")

    rdv = RendezVous(
        patient_id=user["id"],
        medecin_id=data.medecin_id,
        date=data.date,
        heure=data.heure,
        statut="PREVU"
    )

    session.add(rdv)
    session.commit()

    return {"message": "Rendez-vous créé"}

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
    
    # 🔄 Mettre à jour la disponibilité du médecin
    medecin = session.get(ProfilMedecin, rdv.medecin_id)
    if medecin:
        if status.upper() == "TERMINE":
            medecin.est_disponible = True
        elif status.upper() == "EN_COURS":
            medecin.est_disponible = False
        session.add(medecin)

    session.commit()

    return {"message": "updated", "status": status}
# GET ALL RDV
@router.get("/")
def get_rdv(session: Session = Depends(get_session)):
    return session.exec(select(RendezVous)).all()
@router.get("/medecin/{medecin_id}/availability")
def get_available_slots(
    medecin_id: int,
    date_selected: date,
    session: Session = Depends(get_session)
):

    start_hour = 9
    end_hour = 17

    slots = []

    for hour in range(start_hour, end_hour):
        slot = time(hour, 0)

        # vérifier si déjà réservé
        existing = session.exec(
            select(RendezVous).where(
                (RendezVous.medecin_id == medecin_id) &
                (RendezVous.date == date_selected) &
                (RendezVous.heure == slot) &
                (RendezVous.statut != "ANNULE") &
                (RendezVous.statut != "REFUSE")
            )
        ).first()

        if not existing:
            slots.append(slot.strftime("%H:%M"))

    return {
        "date": date_selected,
        "available_slots": slots
    }
@router.get("/summary/{medecin_id}")
def get_summary(medecin_id: int, session: Session = Depends(get_session)):

    medecin = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.id == medecin_id)
    ).first()

    if not medecin:
        return {"error": "Médecin introuvable"}

    #  récupérer nom spécialité
    specialite = session.exec(
        select(Specialite).where(Specialite.id == medecin.specialite_id)
    ).first()

    return {
        "nom": medecin.nom,
        "prenom": medecin.prenom,
        "specialite": specialite.nom if specialite else None,
        "tarif": medecin.tarif
    }