from sqlmodel import select
from models import RendezVous, Review


def compute_score(med, session):

    rdvs = session.exec(
        select(RendezVous).where(RendezVous.medecin_id == med.id)
    ).all()

    notes = []

    for rdv in rdvs:
        review = session.exec(
            select(Review).where(Review.rendezvous_id == rdv.id)
        ).first()

        if review:
            notes.append(review.note)

    moyenne = sum(notes) / len(notes) if notes else 0

    return round(moyenne, 2)