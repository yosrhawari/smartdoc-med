from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import User,ProfilMedecin
from schemas import UserCreate, LoginSchema
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_token

router = APIRouter(prefix="/users", tags=["Users"])

# CREATE USER
@router.post("/register")
def register(user: UserCreate, session: Session = Depends(get_session)):

    # 1. Vérifier si l'email existe
    existing_user = session.exec(
        select(User).where(User.email == user.email)
    ).first()

    if existing_user:
        # Si tu veux que ça marche pour tes tests, supprime l'utilisateur en DB
        # ou utilise un email différent comme medecin2@gmail.com
        raise HTTPException(status_code=400, detail="Email already exists")

    # 2. Hashage
    hashed_pw = hash_password(user.password)

    try:
        # 3. Créer l'objet User (SANS COMMIT TOUT DE SUITE)
        db_user = User(
            email=user.email,
            password=hashed_pw,
            role=user.role.upper()
        )
        session.add(db_user)
        session.flush() # Récupère l'ID de l'user sans fermer la transaction

        # 4. Logique spécifique Médecin
        if db_user.role == "MEDECIN":
            if not user.specialite_nom:
                raise HTTPException(status_code=400, detail="Specialite obligatoire")

            profil = ProfilMedecin(
                user_id=db_user.id,
                nom=user.nom or "",
                prenom=user.prenom or "",
                adresse=user.adresse or "",
                tarif=user.tarif or 0,
                biographie=user.biographie or "",
                diplome_path=user.diplome_path or "",
                statut_validation="en_attente",
                spec_nom_temp=user.specialite_nom
            )
            session.add(profil)

        # 5. UN SEUL COMMIT POUR TOUT
        session.commit()
        return {"message": f"{db_user.role} créé avec succès"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")
# LOGIN
@router.post("/login")
def login(data: LoginSchema, session: Session = Depends(get_session)):

    user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_token({
        "user_id": user.id,
        "role": user.role
    })

    print(hash_password("admin"))
    return {"access_token": token}