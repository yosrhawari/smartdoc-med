from fileinput import filename

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
    # 1. Email check... (Keep as is)

    hashed_pw = hash_password(user.password)

    try:
        db_user = User(
            nom=user.nom,
            prenom=user.prenom,
            email=user.email,
            password=hashed_pw,
            role=user.role.upper()
        )
        session.add(db_user)
        session.flush() 

        if db_user.role == "MEDECIN":
            if not user.spec_nom_temp:
                raise HTTPException(status_code=400, detail="Specialite obligatoire")

            profil = ProfilMedecin(
                user_id=db_user.id,
                nom=db_user.nom,          # Add this
                prenom=db_user.prenom,    # Add this
                adresse=user.adresse or "",
                tarif=user.tarif or 0,
                biographie=user.biographie or "",
                diplome_path=user.diplome_path or "",
                statut_validation="en_attente",
                image=None,               # Set to None or a real string, not the imported 'filename'
                spec_nom_temp=user.spec_nom_temp
            )
            session.add(profil)

        session.commit()
        return {"message": f"{db_user.role} créé avec succès"}

    except Exception as e:
        session.rollback()
        # This will now print the actual error to your terminal so you can see it!
        print(f"DATABASE ERROR: {e}") 
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