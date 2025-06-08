from pydantic import BaseModel
from typing import Optional
from datetime import date

class LibreriaBase(BaseModel):
    autore: str
    titolo: str
    casa_editrice: Optional[str] = None
    venduto: Optional[bool] = False
    prezzo_v: Optional[float] = None
    data_vendita: Optional[date] = None

class LibreriaCreate(LibreriaBase):
    pass

class LibreriaUpdate(LibreriaBase):
    pass

class LibreriaOut(LibreriaBase):
    id: int

    class Config:
        orm_mode = True
