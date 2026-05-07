from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import engine
from models import MedicalRecord, RendezVous, User, ProfilMedecin, Review
from schemas import MedicalRecordCreate, MedicalRecordOut
from utils.dependencies import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/medical-records", tags=["medical-records"])

def get_session():
    with Session(engine) as session:
        yield session

@router.post("/", response_model=MedicalRecordOut)
def upsert_medical_record(record_data: MedicalRecordCreate, session: Session = Depends(get_session)):
    print(f"DEBUG: Upserting record for RDV {record_data.rendezvous_id}")
    # Check if rendezvous exists
    rdv = session.get(RendezVous, record_data.rendezvous_id)
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous not found")

    # Check if record already exists
    statement = select(MedicalRecord).where(MedicalRecord.rendezvous_id == record_data.rendezvous_id)
    existing_record = session.exec(statement).first()

    # Mark RDV as completed
    rdv.statut = "TERMINE"
    session.add(rdv)

    if existing_record:
        # Update
        existing_record.notes = record_data.notes
        existing_record.prescription = record_data.prescription
        session.add(existing_record)
        session.commit()
        session.refresh(existing_record)
        return existing_record
    else:
        # Create
        new_record = MedicalRecord(**record_data.dict())
        session.add(new_record)
        session.commit()
        session.refresh(new_record)
        return new_record

@router.get("/by-rendezvous/{rendezvous_id}", response_model=Optional[MedicalRecordOut])
def get_by_rendezvous(rendezvous_id: int, session: Session = Depends(get_session)):
    statement = select(MedicalRecord).where(MedicalRecord.rendezvous_id == rendezvous_id)
    record = session.exec(statement).first()
    return record
@router.get("/me")
def get_my_medical_records(
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):
    # Get all rendezvous for this patient
    statement = select(MedicalRecord, RendezVous, User, Review).join(
        RendezVous, MedicalRecord.rendezvous_id == RendezVous.id
    ).join(
        ProfilMedecin, RendezVous.medecin_id == ProfilMedecin.id
    ).join(
        User, ProfilMedecin.user_id == User.id
    ).outerjoin(
        Review, Review.rendezvous_id == RendezVous.id
    ).where(RendezVous.patient_id == user["user_id"]).order_by(MedicalRecord.id.desc())
    
    results = session.exec(statement).all()
    
    return [
        {
            "id": rec.id,
            "rendezvous_id": rdv.id,
            "notes": rec.notes,
            "prescription": rec.prescription,
            "date": rdv.date_rdv,
            "doctor_name": f"Dr. {u.nom} {u.prenom}",
            "specialite": "Généraliste",
            "review": { "note": rev.note, "commentaire": rev.commentaire } if rev else None
        }
        for rec, rdv, u, rev in results
    ]
