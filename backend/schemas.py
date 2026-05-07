
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

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
    patient_id: Optional[int] = None
    medecin_id: int
    date_rdv: str
    heure: Optional[str] = None


class ReviewCreate(BaseModel):
    rendezvous_id: int
    note: int
    commentaire: str

class LoginSchema(BaseModel):
    email: str
    password: str
class SymptomeInput(BaseModel):
    patient_info: dict
    symptoms: str
    area: str
    severity: int
    duration: str

class MedicalRecordCreate(BaseModel):
    notes: str
    prescription: str
    rendezvous_id: int

class MedicalRecordOut(BaseModel):
    id: int
    notes: str
    prescription: str
    rendezvous_id: int
    created_at: datetime

class ReviewReply(BaseModel):
    reponse: str