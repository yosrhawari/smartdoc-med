from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
from database import engine
from fastapi.staticfiles import StaticFiles

# routers
from routers import users, medecins, rendezvous, reviews,test,admin,specialite,ai, medical_records

app = FastAPI()

# CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# création des tables
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# inclusion des routes

app.include_router(test.router)
app.include_router(users.router)
app.include_router(medecins.router)
app.include_router(rendezvous.router)
app.include_router(reviews.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(specialite.router)
app.include_router(medical_records.router)
