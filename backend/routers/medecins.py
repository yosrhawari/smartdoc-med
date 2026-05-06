from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from utils.security import hash_password
from database import get_session
from models import ProfilMedecin, Specialite, RendezVous, User
from services.matching_service import find_medecins_by_symptome, find_medecins_advanced
from services.medecin_service import get_medecins_with_rating
from services.ai_service import detect_specialite
from services.score_service import compute_score
from utils.dependencies import get_current_user
import shutil
import os

router = APIRouter(prefix="/medecins", tags=["Medecins"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# CREATE MEDECIN
# =========================
@router.post("/create")
def create_medecin(
    nom: str = Form(...),
    prenom: str = Form(...),
    email: str = Form(...),      
    password: str = Form(...), # <--- Ajoute le mot de passe ici
    adresse: str = Form(...),
    tarif: float = Form(...),
    biographie: str = Form(...),
    specialite_nom: str = Form(...),
    image: UploadFile = File(...),
    session: Session = Depends(get_session)
):
    # 1. Vérifier si l'utilisateur existe déjà
    user = session.exec(select(User).where(User.email == email)).first()

    if not user:
        # 2. S'il n'existe pas, on le crée fard marra
        # Assure-toi d'importer pwd_context ou ta méthode de hashage si nécessaire
        user = User(
            nom=nom,
            prenom=prenom,
            email=email,
            password=hash_password(password), # Idéalement hashé
            role="MEDECIN"
        )
        session.add(user)
        session.flush() # Pour récupérer l'ID sans commiter tout de suite

    user_id = user.id 

    # 3. Sauvegarder l'image
    filename = f"{user_id}_{image.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 4. Créer le profil
    med = ProfilMedecin(
        nom=nom,
        prenom=prenom,
        user_id=user_id,
        adresse=adresse,
        tarif=tarif,
        biographie=biographie,
        image=filename,
        statut_validation="en_attente",
        spec_nom_temp=specialite_nom
    )

    session.add(med)
    session.commit()
    session.refresh(med)

    return med
@router.post("/upload-image")
def upload_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    return {"filename": file.filename}
# =========================
# GET MEDECINS VALIDES
# =========================
@router.get("/")
def get_medecins(session: Session = Depends(get_session)):
    statement = select(ProfilMedecin, User).join(User).where(
        ProfilMedecin.statut_validation == "VALIDE"
    )

    # N-rajj3ou el data b-asmawet s7i7a l-lfront
    return [{
        "id": med.id,
        "nom": user.nom,
        "prenom": user.prenom,
        "adresse": med.adresse,
        "tarif": med.tarif if med.tarif else 0, # Hatha lezem dima numrou
        "image": med.image,
        "specialite": med.spec_nom_temp
    } for med, user in session.exec(statement).all()]
# =========================
# SEARCH SIMPLE
# =========================
@router.get("/search")
def search_medecins(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_by_symptome(symptome, session)


# =========================
# WITH RATING
# =========================
@router.get("/with-rating")
def medecins_with_rating(session: Session = Depends(get_session)):
    return get_medecins_with_rating(session)


# =========================
# SMART SEARCH
# =========================
@router.get("/smart-search")
def smart_search(symptome: str, session: Session = Depends(get_session)):
    return find_medecins_advanced(symptome, session)


# =========================
# AI SEARCH
# =========================
@router.get("/ai-smart-search")
def ai_smart_search(symptome: str, session: Session = Depends(get_session)):

    specialite_nom = detect_specialite(symptome, session)

    specialite = session.exec(
        select(Specialite).where(Specialite.nom == specialite_nom)
    ).first()

    if not specialite:
        specialite = session.exec(
            select(Specialite).where(Specialite.nom == "Médecin généraliste")
        ).first()

        if not specialite:
            return {"message": "Aucune spécialité trouvée"}

    medecins = session.exec(
        select(ProfilMedecin).where(
            ProfilMedecin.specialite_id == specialite.id,
            ProfilMedecin.statut_validation == "VALIDE"
        )
    ).all()

    results = []

    for med in medecins:
        note = compute_score(med, session)

        results.append({
            "medecin_id": med.id,
            "adresse": med.adresse,
            "note": note
        })

    results.sort(key=lambda x: x["note"], reverse=True)

    return {
        "specialite_detected": specialite_nom,
        "medecins": results
    }


# =========================
# ACCEPT RDV
# =========================
@router.put("/rdv/{rdv_id}/accept")
def accepter_rdv(
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

    rdv.statut = "ACCEPTE"
    session.add(rdv)
    session.commit()

    return {"message": "Rendez-vous accepté"}


# =========================
# REFUSE RDV
# =========================
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


# =========================
# GET RDV MEDECIN
# =========================
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


# =========================
# GET BY ID
# =========================
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
        "biographie": med.biographie,
        "image": med.image
    }