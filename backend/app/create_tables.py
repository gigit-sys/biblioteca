# create_tables.py
from app.database import Base, engine
from app.models.user import User  # importa il modello User da user.py

Base.metadata.create_all(bind=engine)
