from sqlmodel import Session, select
from models import ProfilMedecin, RendezVous, Review


def get_medecins_with_rating(session: Session):

    medecins = session.exec(select(ProfilMedecin)).all()

    result = []

    for med in medecins:

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

        result.append({
            "medecin_id": med.id,
            "adresse": med.adresse,
            "note_moyenne": round(moyenne, 2)
        })

    return result