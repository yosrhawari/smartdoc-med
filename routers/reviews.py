from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Review, RendezVous
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

    if not rdv or rdv.statut != "TERMINE":
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