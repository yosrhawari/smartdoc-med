from sqlmodel import Session, select
from models import ProfilMedecin, RendezVous, Review, User, Specialite
try:
    from .availability_service import get_next_available
except ImportError:
    from services.availability_service import get_next_available

def get_medecins_with_rating(session: Session):
    # 🔹 Filtrer uniquement les médecins validés
    medecins = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "VALIDE")
    ).all()

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
        
        # 🕒 Récupérer la prochaine disponibilité
        next_avail = get_next_available(med.id, session)

        # 🏥 Spécialité
        spec = session.get(Specialite, med.specialite_id) if med.specialite_id else None

        result.append({
            "id": med.id,
            "medecin_id": med.id,
            "nom": med.nom or "Docteur",
            "prenom": med.prenom or "",
            "adresse": med.adresse or "Non renseignée",
            "tarif": med.tarif or 0,
            "specialite": spec.nom if spec else "Médecin",
            "note_moyenne": round(moyenne, 2),
            "est_disponible": getattr(med, "est_disponible", True),
            "prochain_rdv": next_avail
        })
        
    return result