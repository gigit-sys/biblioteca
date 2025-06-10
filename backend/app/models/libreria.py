from sqlalchemy import Column, Integer, String, Boolean, Float, Date
from app.database import Base

class Libreria(Base):
    __tablename__ = "libreria"

    id = Column(Integer, primary_key=True, index=True)
    autore = Column(String(255), index=True)
    titolo = Column(String(255), index=True)
    casa_editrice = Column(String(255), index=True)
    venduto = Column(Boolean, default=False)
    prezzo_v = Column(Float, nullable=True)
    data_vendita = Column(Date, nullable=True)
    pagato = Column(Boolean, default=False)  # 👉 AGGIUNGI QUESTA
