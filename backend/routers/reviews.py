from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Review, RendezVous, MedicalRecord
from schemas import ReviewCreate
from utils.dependencies import get_current_user
from utils.role_checker import require_role

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# CREATE REVIEW
@router.post("/")
def create_review(
    review: Review,
    session: Session = Depends(get_session),
    user = Depends(require_role("PATIENT"))
):
    rdv = session.get(RendezVous, review.rendezvous_id)
    has_record = session.exec(select(MedicalRecord).where(MedicalRecord.rendezvous_id == review.rendezvous_id)).first()
    
    if not rdv or (rdv.statut.upper() not in ["TERMINE", "COMPLETED"] and not has_record):
        raise HTTPException(status_code=400, detail="RDV not valid")

    # prevent duplicate review
    existing = session.exec(
        select(Review).where(Review.rendezvous_id == rdv.id)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")

    session.add(review)
    session.commit()
    session.refresh(review)

    return review

# GET REVIEWS
@router.get("/")
def get_reviews(session: Session = Depends(get_session)):
    return session.exec(select(Review)).all()

# GET MY REVIEWS (For Doctors)
@router.get("/me")
def get_my_reviews(
    session: Session = Depends(get_session),
    user = Depends(require_role("MEDECIN"))
):
    from models import ProfilMedecin, User
    
    profil = session.exec(select(ProfilMedecin).where(ProfilMedecin.user_id == user["user_id"])).first()
    if not profil:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
        
    statement = select(Review, RendezVous, User).join(
        RendezVous, Review.rendezvous_id == RendezVous.id
    ).join(
        User, RendezVous.patient_id == User.id
    ).where(RendezVous.medecin_id == profil.id).order_by(Review.id.desc())
    
    results = session.exec(statement).all()
    
    return [
        {
            "id": rev.id,
            "note": rev.note,
            "commentaire": rev.commentaire,
            "reponse_medecin": rev.reponse_medecin,
            "date": rdv.date_rdv,
            "heure": rdv.heure,
            "patient_name": f"{u.nom} {u.prenom}",
            "patient_email": u.email
        }
        for rev, rdv, u in results
    ]

# REPLY TO REVIEW
from schemas import ReviewReply
@router.put("/{review_id}/reply")
def reply_to_review(
    review_id: int,
    reply: ReviewReply,
    session: Session = Depends(get_session),
    user = Depends(require_role("MEDECIN"))
):
    review = session.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    # Security: check if this review belongs to the doctor
    from models import ProfilMedecin
    profil = session.exec(select(ProfilMedecin).where(ProfilMedecin.user_id == user["user_id"])).first()
    
    rdv = session.get(RendezVous, review.rendezvous_id)
    if rdv.medecin_id != profil.id:
        raise HTTPException(status_code=403, detail="Not authorized to reply to this review")

    review.reponse_medecin = reply.reponse
    session.add(review)
    session.commit()
    session.refresh(review)
    return review