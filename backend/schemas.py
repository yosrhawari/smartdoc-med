
from pydantic import BaseModel
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import date, time

class UserCreate(SQLModel):
    email: str
    password: str
    role: str
    nom: Optional[str] = None
    prenom: Optional[str] = None
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
    medecin_id: int
    date: date
    heure: time


class ReviewCreate(BaseModel):
    rendezvous_id: int
    note: int
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
  