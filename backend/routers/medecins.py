from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlmodel import Session, select
from database import get_session
from models import ProfilMedecin,Specialite,RendezVous, User
from schemas import MedecinCreate, ProfileUpdateData
from services.matching_service import find_medecins_by_symptome
from services.medecin_service import get_medecins_with_rating
from services.matching_service import find_medecins_advanced
from services.ai_service import detect_specialite
from services.score_service import compute_score
from utils.dependencies import get_current_user
from services.availability_service import get_next_available
from fastapi import UploadFile, File, Form
import shutil
import os


router = APIRouter(prefix="/medecins", tags=["Medecins"])

 
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/create")
def create_medecin(
    user_id: int = Form(...),
    nom: str = Form(...),
    prenom: str = Form(...),
    adresse: str = Form(...),
    tarif: float = Form(...),
    specialite_nom: str = Form(...),
    image: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    import os, shutil

    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    #  sauvegarder image
    filename = f"{user_id}_{image.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    #  créer profil médecin (spécialité en attente)
    med = ProfilMedecin(
        user_id=user_id,
        nom=nom,
        prenom=prenom,
        adresse=adresse,
        tarif=tarif,
        specialite_id=None,          # sera ajouté après validation admin
        spec_nom_temp=specialite_nom, # ✔ stockage temporaire propre
        diplome_path=filename,
        statut_validation="en_attente"
    )

    session.add(med)
    session.commit()
    session.refresh(med)

    return {
        "message": "Médecin créé, en attente de validation",
        "medecin_id": med.id
    }

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

# ── Schema for profile update ────────────────────────────────────────────────


# ── GET /medecins/me ──────────────────────────────────────────────────────────
@router.get("/me")
def get_my_profile(
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):
    if user["role"] != "MEDECIN":
        raise HTTPException(status_code=403, detail="Accès interdit")

    profil = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == user["id"])
    ).first()

    if not profil:
        raise HTTPException(status_code=404, detail="Profil introuvable")

    user_obj = session.get(User, user["id"])
    spec = session.get(Specialite, profil.specialite_id) if profil.specialite_id else None

    return {
        "id": profil.id,
        "user_id": profil.user_id,
        "email": user_obj.email if user_obj else "",
        "nom": profil.nom,
        "prenom": profil.prenom,
        "adresse": profil.adresse,
        "tarif": profil.tarif,
        "biographie": profil.biographie,
        "specialite_id": profil.specialite_id,
        "specialite": spec.nom if spec else "",
        "image": getattr(profil, "image_path", None)
    }


# ── PUT /medecins/me/update ───────────────────────────────────────────────────
@router.put("/me/update")
def update_my_profile(
    data: ProfileUpdateData,
    session: Session = Depends(get_session),
    user = Depends(get_current_user)
):
    if user["role"] != "MEDECIN":
        raise HTTPException(status_code=403, detail="Accès interdit")

    profil = session.exec(
        select(ProfilMedecin).where(ProfilMedecin.user_id == user["id"])
    ).first()

    if not profil:
        raise HTTPException(status_code=404, detail="Profil introuvable")

    if data.nom is not None:          profil.nom = data.nom
    if data.prenom is not None:       profil.prenom = data.prenom
    if data.adresse is not None:      profil.adresse = data.adresse
    if data.tarif is not None:        profil.tarif = data.tarif
    if data.biographie is not None:   profil.biographie = data.biographie
    if data.specialite_id is not None: profil.specialite_id = data.specialite_id

    session.add(profil)
    session.commit()
    session.refresh(profil)

    return {"message": "Profil mis à jour avec succès"}


@router.get("/{id}")
def get_medecin_by_id(id: int, session: Session = Depends(get_session)):

    med = session.get(ProfilMedecin, id)

    if not med:
        raise HTTPException(status_code=404, detail="Médecin introuvable")

    user = session.get(User, med.user_id)

    # 🏥 Spécialité
    spec = session.get(Specialite, med.specialite_id) if med.specialite_id else None

    return {
        "id": med.id,
        "medecin_id": med.id,
        "nom": med.nom,
        "prenom": med.prenom,
        "adresse": med.adresse,
        "tarif": med.tarif,
        "specialite": spec.nom if spec else "Médecin",
        "biographie": med.biographie,
        "est_disponible": getattr(med, "est_disponible", True),
        "prochain_rdv": get_next_available(med.id, session),
        "image": med.image  
    }
    
