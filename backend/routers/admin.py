from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session,select

from database import get_session
from models import ProfilMedecin, User,ProfilMedecin, RendezVous, Review,Specialite

from utils.role_checker import require_role

router = APIRouter(prefix="/admin", tags=["admin"])

@router.put("/medecins/{id}/validate")
def validate_medecin(
    id: int,
    session: Session = Depends(get_session),
    user_admin = Depends(require_role("ADMIN"))
):

    med = session.get(ProfilMedecin, id)

    if not med:
        raise HTTPException(status_code=404, detail="Medecin not found")

    # njibo user
    user = session.get(User, med.user_id)

    if user:
        med.nom = user.nom
        med.prenom = user.prenom

    # Specialty logic
    if not med.specialite_id and med.spec_nom_temp:
        specialite = session.exec(
            select(Specialite).where(Specialite.nom == med.spec_nom_temp)
        ).first()

        if not specialite:
            specialite = Specialite(nom=med.spec_nom_temp, mots_cles="")
            session.add(specialite)
            session.commit()
            session.refresh(specialite)

        med.specialite_id = specialite.id
    
    med.statut_validation = "VALIDE"

    session.add(med)
    session.commit()

    return {"message": "Medecin validé"}
@router.get("/stats")
def get_stats(
    session: Session = Depends(get_session),
    user = Depends(require_role("ADMIN"))
):
    # Users
    total_users = len(session.exec(select(User)).all())

    # Doctors
    total_medecins = len(session.exec(select(ProfilMedecin)).all())

    medecins_valides = len(session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "VALIDE")
    ).all())

    medecins_attente = len(session.exec(
        select(ProfilMedecin).where(ProfilMedecin.statut_validation == "EN_ATTENTE")
    ).all())

    # RDV
    total_rdv = len(session.exec(select(RendezVous)).all())

    # Reviews
    total_reviews = len(session.exec(select(Review)).all())

    return {
        "users": total_users,
        "medecins": {
            "total": total_medecins,
            "valides": medecins_valides,
            "en_attente": medecins_attente
        },
        "rendezvous": total_rdv,
        "reviews": total_reviews
    }
@router.get("/users")
def get_all_users(
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    users = session.exec(select(User)).all()

    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "nom": u.nom,
            "prenom": u.prenom
        }
        for u in users
    ]
from sqlmodel import select

@router.get("/pending")
def get_pending_medecins(session: Session = Depends(get_session)):
    # Join with User and Specialite (outer join for specialty)
    statement = select(ProfilMedecin, User, Specialite).join(
        User, ProfilMedecin.user_id == User.id
    ).join(
        Specialite, ProfilMedecin.specialite_id == Specialite.id, isouter=True
    ).where(
        ProfilMedecin.statut_validation == "EN_ATTENTE"
    )
    results = session.exec(statement).all()

    final_result = []
    for med, user, spec in results:
        # Priority to validated specialty name, then temp name
        specialite_nom = spec.nom if spec else med.spec_nom_temp
        
        final_result.append({
            "id": med.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "adresse": med.adresse,
            "tarif": med.tarif,
            "biographie": med.biographie,
            "image": med.image,
            "specialite": specialite_nom
        })

    return final_result

@router.get("/medecins")
def get_all_medecins(
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    # Join with User and Specialite
    statement = select(ProfilMedecin, User, Specialite).join(
        User, ProfilMedecin.user_id == User.id
    ).join(
        Specialite, ProfilMedecin.specialite_id == Specialite.id, isouter=True
    )
    results = session.exec(statement).all()

    final_result = []
    for med, user, spec in results:
        # Priority to validated specialty name, then temp name
        specialite_nom = spec.nom if spec else med.spec_nom_temp
        
        final_result.append({
            "id": med.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "adresse": med.adresse,
            "tarif": med.tarif,
            "image": med.image,
            "specialite": specialite_nom,
            "statut_validation": med.statut_validation
        })

    return final_result

@router.delete("/users/{id}")
def delete_user(
    id: int,
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If it's a doctor, delete the profile too
    if user.role == "MEDECIN":
        profil = session.exec(select(ProfilMedecin).where(ProfilMedecin.user_id == id)).first()
        if profil:
            session.delete(profil)
            
    session.delete(user)
    session.commit()
    return {"message": "User deleted"}

@router.put("/users/{id}")
def update_user(
    id: int,
    data: dict,
    session: Session = Depends(get_session),
    admin = Depends(require_role("ADMIN"))
):
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.email = data.get("email", user.email)
    if "password" in data and data["password"]:
        from utils.security import hash_password
        user.password = hash_password(data["password"])
    
    if user.role == "MEDECIN":
        profil = session.exec(select(ProfilMedecin).where(ProfilMedecin.user_id == id)).first()
        if profil:
            if "specialite_nom" in data:
                profil.spec_nom_temp = data["specialite_nom"]
            session.add(profil)
            
    session.add(user)
    session.commit()
    return {"message": "User updated"}