from typing import Optional
from sqlmodel import SQLModel, Field


# USERS
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password: str
    role: str  # PATIENT / MEDECIN / ADMIN


# SPECIALITE
class Specialite(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nom: str
    mots_cles: str


# PROFIL MEDECIN
class ProfilMedecin(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    specialite_id: int
    adresse: str
    tarif: float
    biographie: Optional[str] = None
    diplome_path: Optional[str] = None
    statut_validation: str = "EN_ATTENTE"


# RENDEZ-VOUS
class RendezVous(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int
    medecin_id: int
    date_rdv: str
    statut: str = "PREVU"


# REVIEW
class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rendezvous_id: int
    note: int
    commentaire: str
    reponse_medecin: Optional[str] = None

