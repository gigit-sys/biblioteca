from fastapi import Depends, HTTPException
from app.auth.auth_bearer import JWTBearer
from jose import JWTError, jwt
from app.config import JWT_SECRET

def require_role(required_roles):
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def role_dependency(payload: dict = Depends(JWTBearer())):
        user_role = payload.get("role")
        if user_role not in required_roles:
            raise HTTPException(status_code=403, detail="Accesso negato")
        return payload

    return role_dependency

