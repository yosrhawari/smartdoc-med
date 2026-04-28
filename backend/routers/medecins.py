from fastapi import APIRouter, Depends,HTTPException
from sqlmodel import Session, select
from database import get_session
from models import ProfilMedecin,Specialite,RendezVous, User
from schemas import MedecinCreate
from services.matching_service import find_medecins_by_symptome
from services.medecin_service import get_medecins_with_rating
from services.matching_service import find_medecins_advanced
from services.ai_service import detect_specialite
from services.score_service import compute_score
from utils.dependencies import get_current_user


router = APIRouter(prefix="/medecins", tags=["Medecins"])

# CREATE MEDECIN
from models import Specialite
from sqlmodel import select


@router.post("/create")
def create_medecin(data: dict, session: Session = Depends(get_session)):

    specialite_nom = data.get("specialite_nom")

    # chercher si spécialité existe
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    #  ne pas créer maintenant → attendre validation admin
    med = ProfilMedecin(
        user_id=data["user_id"],
        adresse=data["adresse"],
        tarif=data["tarif"],
        specialite_id=None  # sera ajouté plus tard
    )

    #  stocker temporairement dans mémoire (ou payload)
    med._specialite_nom = specialite_nom  #  hack temporaire

    session.add(med)
    session.commit()

    return med

# GET ALL MEDECINS (VALIDES SEULEMENT)
@router.get("/")
def get_medecins(session: Session = Depends(get_session)):
    statement = select(ProfilMedecin).where(
        ProfilMedecin.statut_validation == "VALIDE"
    )
    return session.exec(statement).all()
#find medecin by symptome
@router.get("/search")
def search_medecins(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_by_symptome(symptome, session)
#get medecinsz with rating
@router.get("/with-rating")
def medecins_with_rating(session: Session = Depends(get_session)):
    return get_medecins_with_rating(session)

@router.get("/smart-search")
def smart_search(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_advanced(symptome, session)



@router.get("/ai-smart-search")
def ai_smart_search(symptome: str, session: Session = Depends(get_session)):

    # 1️⃣ IA → détecter spécialité
    specialite_nom = detect_specialite(symptome, session)

    # 2️⃣ récupérer spécialité DB
    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    # 🔥 fallback si spécialité introuvable
    if not specialite:
        specialite = session.exec(
            select(Specialite).where(Specialite.nom == "Médecin généraliste")
        ).first()

        if not specialite:
            return {"message": "Aucune spécialité trouvée"}

    # 3️⃣ récupérer médecins validés
    medecins = session.exec(
        select(ProfilMedecin).where(
            ProfilMedecin.specialite_id == specialite.id,
            ProfilMedecin.statut_validation == "VALIDE"
        )
    ).all()

    # 4️⃣ scoring
    results = []

    for med in medecins:
        note = compute_score(med, session)

        results.append({
            "medecin_id": med.id,
            "adresse": med.adresse,
            "note": note
        })

    # 5️⃣ tri
    results.sort(key=lambda x: x["note"], reverse=True)

    return {
        "specialite_detected": specialite_nom,
        "medecins": results
    }
@router.put("/rdv/{rdv_id}/accept")
def accepter_rdv(
    rdv_id: int,
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):

    # 🔹 vérifier rôle
    if user["role"] != "MEDECIN":
        raise HTTPException(status_code=403, detail="Accès interdit")

    # 🔹 récupérer profil médecin
    profil = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == user["id"])
    ).first()

    if not profil:
        raise HTTPException(status_code=404, detail="Profil médecin introuvable")

    # 🔹 récupérer rdv
    rdv = session.exec(
        select(RendezVous).where(RendezVous.id == rdv_id)
    ).first()

    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")

    # 🔹 vérifier que ce rdv appartient au médecin
    if rdv.medecin_id != profil.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    # 🔥 update statut
    rdv.statut = "ACCEPTE"
    session.add(rdv)
    session.commit()

    return {"message": "Rendez-vous accepté"}
@router.put("/rdv/{rdv_id}/refuse")
def refuser_rdv(
    rdv_id: int,
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):

    if user["role"] != "MEDECIN":
        raise HTTPException(status_code=403, detail="Accès interdit")

    profil = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == user["id"])
    ).first()

    rdv = session.exec(
        select(RendezVous).where(RendezVous.id == rdv_id)
    ).first()

    if not rdv or not profil:
        raise HTTPException(status_code=404, detail="Introuvable")

    if rdv.medecin_id != profil.id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    rdv.statut = "REFUSE"
    session.add(rdv)
    session.commit()

    return {"message": "Rendez-vous refusé"}
@router.get("/rdv")
def get_mes_rdv(
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):

    if user["role"] != "MEDECIN":
        raise HTTPException(status_code=403, detail="Accès interdit")

    profil = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == user["id"])
    ).first()

    rdvs = session.exec(
        select(RendezVous).where(RendezVous.medecin_id == profil.id)
    ).all()

    return rdvs
@router.get("/{id}")
def get_medecin_by_id(id: int, session: Session = Depends(get_session)):

    med = session.get(ProfilMedecin, id)

    if not med:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    user = session.get(User, med.user_id)

    return {
        "id": med.id,
        "nom": user.nom if user else None,
        "prenom": user.prenom if user else None,
        "adresse": med.adresse,
        "tarif": med.tarif,
        "biographie": med.biographie
    }
