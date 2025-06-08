from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.models.user import User
from app.database import SessionLocal
from passlib.hash import bcrypt
from app.auth.auth_handler import create_access_token
from app.auth.auth_bearer import JWTBearer
from app.auth.role_checker import require_role


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email già registrata")
    hashed = bcrypt.hash(user.password)
    role = user.role if hasattr(user, 'role') else "user"  # se hai modificato lo schema per includere role
    new_user = User(email=user.email, hashed_password=hashed, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not bcrypt.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    token_data = {"sub": db_user.email, "role": db_user.role}
    token = create_access_token(token_data)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/protected")
async def protected_route(user_data = Depends(JWTBearer())):
    # user_data è il payload del token decodificato
    return {"message": f"Ciao {user_data['sub']}! Sei autenticato."}

from app.auth.role_checker import require_role

@router.get("/admin-only")
def admin_route(user_data = Depends(require_role("admin"))):
    return {"message": f"Benvenuto admin {user_data['sub']}"}

@router.get("/admin-area")
def admin_area(user_data = Depends(require_role("admin"))):
    return {"message": "Solo admin qui!"}

@router.get("/staff-area")
def staff_area(user_data = Depends(require_role(["admin", "staff"]))):
    return {"message": f"Benvenuto {user_data['sub']} con ruolo {user_data['role']}"}

@router.get("/dashboard")
def dashboard(user_data = Depends(require_role(["admin", "staff"]))):
    return {"message": f"Benvenuto {user_data['sub']} con ruolo {user_data['role']}"}
