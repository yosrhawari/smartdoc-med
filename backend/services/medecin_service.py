from sqlmodel import Session, select
from models import ProfilMedecin, RendezVous, Review ,User



def get_rating_for_medecin(med_id: int, session: Session):
    rdvs = session.exec(
        select(RendezVous).where(RendezVous.medecin_id == med_id)
    ).all()
    notes = []
    for rdv in rdvs:
        review = session.exec(
            select(Review).where(Review.rendezvous_id == rdv.id)
        ).first()
        if review:
            notes.append(review.note)
    moyenne = sum(notes) / len(notes) if notes else 0
    return {"moyenne": round(moyenne, 2), "count": len(notes)}

def get_medecins_with_rating(session: Session):
    medecins = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "VALIDE")
    ).all()

    result = []
    for med in medecins:
        user = session.get(User, med.user_id)
        rating_info = get_rating_for_medecin(med.id, session)

        # Fetch specialty name
        specialite_nom = med.spec_nom_temp
        if med.specialite_id:
            from models import Specialite
            spec = session.get(Specialite, med.specialite_id)
            if spec:
                specialite_nom = spec.nom

        result.append({
            "id": med.id,
            "nom": user.nom if user else None,
            "prenom": user.prenom if user else None,
            "adresse": med.adresse,
            "tarif": med.tarif if med.tarif else 0,
            "note_moyenne": rating_info["moyenne"],
            "nombre_reviews": rating_info["count"],
            "image": med.image,
            "specialite": specialite_nom,
            "biographie": med.biographie,
            "statut_validation": med.statut_validation   
        })
        
    return result