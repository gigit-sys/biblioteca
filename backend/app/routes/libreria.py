from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.libreria import Libreria
from app.schemas.libreria import LibreriaCreate, LibreriaOut, LibreriaUpdate

from app.auth.role_checker import require_role


router = APIRouter(prefix="/libreria", tags=["libreria"])

# Rotta GET, accessibile a qualsiasi utente autenticato (qualsiasi ruolo)
@router.get("/", response_model=list[LibreriaOut], dependencies=[Depends(require_role(["admin", "user"]))])
def get_libri(db: Session = Depends(get_db)):
    return db.query(Libreria).all()

# Rotte POST, PUT, DELETE solo admin
@router.post("/", response_model=LibreriaOut, dependencies=[Depends(require_role("admin"))])
def crea_libro(libro: LibreriaCreate, db: Session = Depends(get_db)):
    nuovo_libro = Libreria(**libro.dict())
    db.add(nuovo_libro)
    db.commit()
    db.refresh(nuovo_libro)
    return nuovo_libro

@router.put("/{libro_id}", response_model=LibreriaOut, dependencies=[Depends(require_role("admin"))])
def aggiorna_libro(libro_id: int, dati: LibreriaUpdate, db: Session = Depends(get_db)):
    libro = db.query(Libreria).filter(Libreria.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro non trovato")
    for key, value in dati.dict(exclude_unset=True).items():
        setattr(libro, key, value)
    db.commit()
    db.refresh(libro)
    return libro

@router.delete("/{libro_id}", dependencies=[Depends(require_role("admin"))])
def elimina_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libreria).filter(Libreria.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro non trovato")
    db.delete(libro)
    db.commit()
    return {"detail": "Libro eliminato"}

@router.get("/{libro_id}", response_model=LibreriaOut, dependencies=[Depends(require_role(["admin", "user"]))])
def get_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libreria).filter(Libreria.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro non trovato")
    return libro
