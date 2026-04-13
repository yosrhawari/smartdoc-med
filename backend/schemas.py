
from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str
    role: str


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
    