
from pydantic import BaseModel, Field
from typing import Optional
from sqlmodel import SQLModel
from datetime import date, time

class UserCreate(SQLModel):
    nom: str
    prenom: str
    email: str
    password: str
    role: str
    # Ajoute ces champs pour qu'ils soient acceptés dans le JSON
    spec_nom_temp: Optional[str] = None
    adresse: Optional[str] = None
    tarif: Optional[float] = 0
    biographie: Optional[str] = None  # <--- C'est lui qui manquait !
    diplome_path: Optional[str] = None
    image: Optional[str] = None

class MedecinCreate(BaseModel):
    nom: str
    prenom: str
    user_id: int
    specialite_id: int
    adresse: str
    tarif: float


class RendezVousCreate(BaseModel):
    medecin_id: int
    date: date
    heure: time


class ReviewCreate(BaseModel):
    rendezvous_id: int
    note: int = Field(ge=0, le=5)
    commentaire: str

class LoginSchema(BaseModel):
    email: str
    password: str
class SymptomeInput(BaseModel):
    symptome: str
class ProfileUpdateData(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    adresse: Optional[str] = None
    tarif: Optional[float] = None
    biographie: Optional[str] = None
    specialite_id: Optional[int] = None
  