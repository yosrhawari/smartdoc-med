from typing import Optional
from sqlmodel import SQLModel, Field


# USERS
class User(SQLModel, table=True):
    __tablename__ = "users"
    nom: str
    prenom: str

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
    user_id: int = Field(foreign_key="users.id")
    specialite_id: Optional[int] = Field(default=None, foreign_key="specialite.id")
    adresse: str
    nom: str
    prenom: str
    tarif: float
    biographie: Optional[str] = None
    diplome_path: Optional[str] = None
    statut_validation: str = "en_attente"
    spec_nom_temp: Optional[str] = None  # cache temporaire pour spécialité
    image: Optional[str] = None  # chemin vers l'image de profil


# RENDEZ-VOUS
class RendezVous(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int
    medecin_id: int
    date_rdv: str
    statut: str = "prevu"


# REVIEW
class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    rendezvous_id: int
    note: int
    commentaire: str
    reponse_medecin: Optional[str] = None

