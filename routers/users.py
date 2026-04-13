from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import User
from schemas import UserCreate, LoginSchema
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_token

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