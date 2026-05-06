from sqlmodel import Session, select
from models import ProfilMedecin, RendezVous, Review ,User



def get_medecins_with_rating(session: Session):

    medecins = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "VALIDE")
    ).all()

    result = []

    for med in medecins:
        user = session.exec(
            select(User).where(User.id == med.user_id)
        ).first()
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
            "id": med.id,
            "nom": user.nom ,
            "prenom": user.prenom ,
            "adresse": med.adresse,
            "note_moyenne": round(moyenne, 2),
            "image": med.image,
            "specialite": med.spec_nom_temp ,
            "statut_validation": med.statut_validation   
        })
        
    return result