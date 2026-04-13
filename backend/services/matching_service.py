from sqlmodel import Session, select
from models import Specialite, ProfilMedecin, RendezVous, Review


def find_medecins_by_symptome(symptome: str, session: Session):

    # récupérer spécialités el kol
    specialites = session.exec(select(Specialite)).all()

    matched_specialites = []

    # matching aadyy
    for spec in specialites:
        mots = spec.mots_cles.lower().split(",")

        for mot in mots:
            if mot.strip() in symptome.lower():
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

    # 1. Calcul score de matching
    for spec in specialites:
        mots = [m.strip().lower() for m in spec.mots_cles.split(",")]

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

            # score final
            final_score = item["score"] * 2 + moyenne

            results.append({
                "medecin_id": med.id,
                "adresse": med.adresse,
                "score_matching": item["score"],
                "note_moyenne": round(moyenne, 2),
                "score_final": round(final_score, 2)
            })

    # 3. TRI FINAL
    results.sort(key=lambda x: x["score_final"], reverse=True)

    return results

