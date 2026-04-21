
from pydantic import BaseModel
from typing import Optional
from sqlmodel import SQLModel, Field

class UserCreate(SQLModel):
    email: str
    password: str
    role: str
    # Ajoute ces champs pour qu'ils soient acceptés dans le JSON
    specialite_nom: Optional[str] = None
    adresse: Optional[str] = None
    tarif: Optional[float] = 0
    biographie: Optional[str] = None  # <--- C'est lui qui manquait !
    diplome_path: Optional[str] = None

class MedecinCreate(BaseModel):
    user_id: int
    specialite_id: int
    adresse: str
    tarif: float


class RendezVousCreate(BaseModel):
    patient_id: int
    medecin_id: int
    date_rdv: str


class ReviewCreate(BaseModel):
    rendezvous_id: int
    note: int
    commentaire: str

class LoginSchema(BaseModel):
    email: str
    password: str
    