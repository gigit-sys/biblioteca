from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.auth_handler import verify_token

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            payload = verify_token(credentials.credentials)
            if not payload:
                raise HTTPException(status_code=403, detail="Invalid token")
            return payload  # ritorni il payload per usarlo dopo
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization")
