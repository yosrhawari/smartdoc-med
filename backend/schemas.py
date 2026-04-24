
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
class DoctorRegister(BaseModel):
    email: str
    password: str
    specialite_id: int | None = None
    autre_specialite: str | None = None
    adresse: str
    tarif: float
    biographie: str