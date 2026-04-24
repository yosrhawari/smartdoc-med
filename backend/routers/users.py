from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import User
from schemas import UserCreate, LoginSchema
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_token
from passlib.hash import bcrypt
from pydantic import BaseModel
from models import User, ProfilMedecin, Specialite
from schemas import DoctorRegister

router = APIRouter(prefix="/users", tags=["Users"])

# CREATE USER
@router.post("/")
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    db_user = User(**user.dict())
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

# GET ALL USERS
@router.get("/")
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users
# REGISTER
@router.post("/register")
def register(user: UserCreate, session: Session = Depends(get_session)):

    # vérifier si email existe
    existing_user = session.exec(
        select(User).where(User.email == user.email)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = hash_password(user.password)

    db_user = User(
        email=user.email,
        password=hashed_password,
        role=user.role
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)

    return {"message": "User created"}
@router.post("/register-doctor")
def register_doctor(data: DoctorRegister, session: Session = Depends(get_session)):

    # check email
    existing = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # create user
    user = User(
        email=data.email,
        password=hash_password(data.password),
        role="MEDECIN"
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # spécialité
    specialite_id = data.specialite_id

    if data.autre_specialite:
        new_sp = Specialite(nom=data.autre_specialite)
        session.add(new_sp)
        session.commit()
        session.refresh(new_sp)
        specialite_id = new_sp.id

    # create profil
    profil = ProfilMedecin(
        user_id=user.id,
        specialite_id=specialite_id,
        adresse=data.adresse,
        tarif=data.tarif,
        biographie=data.biographie,
        statut_validation="EN_ATTENTE"
    )

    session.add(profil)
    session.commit()

    return {"message": "Doctor created successfully"}

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

    return {"access_token": token}