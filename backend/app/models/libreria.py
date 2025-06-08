# models.py
from sqlalchemy import Column, Integer, String, Boolean, Float, Date
from app.database import Base

class Libreria(Base):
    __tablename__ = "libreria"

    id = Column(Integer, primary_key=True, index=True)
    autore = Column(String, index=True)
    titolo = Column(String, index=True)
    casa_editrice = Column(String, index=True)
    venduto = Column(Boolean, default=False)  # <-- campo venduto
    prezzo_v = Column(Float, nullable=True)
    data_vendita = Column(Date, nullable=True)
