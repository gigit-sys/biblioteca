from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- importa il middleware
from app.routes import auth
from app.database import Base, engine
from app.routes import libreria

Base.metadata.create_all(bind=engine)

app = FastAPI()

# ✅ Aggiungi il middleware CORS qui
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # metti l'URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Importa le route dopo aver creato l'app
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(libreria.router)
