from sqlmodel import Session, select
from models import Specialite, ProfilMedecin, RendezVous, Review
from services.availability_service import get_next_available


def find_medecins_by_symptome(symptome: str, session: Session):

    specialites = session.exec(select(Specialite)).all()

    matched_specialites = []

    for spec in specialites:
        mots_cles = (spec.mots_cles or "").lower().split(",")
        mots = [m.strip() for m in mots_cles if m.strip()]

        for mot in mots:
            if mot in symptome.lower():
                matched_specialites.append(spec.id)
                break

    # récupérer les médecins ly validés mel admin khw
    if not matched_specialites:
        return []

    medecins = session.exec(
        select(ProfilMedecin).where(
            ProfilMedecin.specialite_id.in_(matched_specialites),
            ProfilMedecin.statut_validation == "VALIDE"
        )
    ).all()

    return medecins


def find_medecins_advanced(symptome: str, session: Session):

    symptome = symptome.lower()

    specialites = session.exec(select(Specialite)).all()

    matched = []

    for spec in specialites:
        mots_cles = (spec.mots_cles or "").lower().split(",")
        mots = [m.strip() for m in mots_cles if m.strip()]

        score = 0
        for mot in mots:
            if mot in symptome:
                score += 1

        if score > 0:
            matched.append({
                "specialite_id": spec.id,
                "score": score
            })

    if not matched:
        return []

    results = []

    # 2. Récupérer médecins + calcul note
    for item in matched:
        medecins = session.exec(
            select(ProfilMedecin).where(
                ProfilMedecin.specialite_id == item["specialite_id"],
                ProfilMedecin.statut_validation == "VALIDE"
            )
        ).all()

        for med in medecins:

            # récupérer notes
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

            max_possible_score = max(item["score"] for item in matched) if matched else 1
            normalized_score = item["score"] / max_possible_score
            final_score = normalized_score * 5 + moyenne

            spec_obj = session.get(Specialite, med.specialite_id)
            spec_name = spec_obj.nom if spec_obj else "Médecin"

            results.append({
                "medecin_id": med.id,
                "nom": med.nom,
                "prenom": med.prenom,
                "specialite": spec_name,
                "tarif": med.tarif,
                "est_disponible": getattr(med, "est_disponible", False),
                "prochain_rdv": get_next_available(med.id, session),
                "adresse": med.adresse,
                "score_matching": item["score"],
                "note_moyenne": round(moyenne, 2),
                "score_final": round(final_score, 2)
            })

    results.sort(key=lambda x: x["score_final"], reverse=True)

    return results

