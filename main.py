from fastapi import FastAPI
from sqlmodel import SQLModel
from database import engine

# routers
from routers import users, medecins, rendezvous, reviews,test,admin

app = FastAPI()

# création des tables
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# inclusion des routes

app.include_router(test.router)
app.include_router(users.router)
app.include_router(medecins.router)
app.include_router(rendezvous.router)
app.include_router(reviews.router)
app.include_router(admin.router)