from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.crud.user import get_user_by_id
from app.db.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception
    
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")

        if user_id_str is None:
            raise credentials_exception
        
        user_id = int(user_id_str)

    except (ValueError, TypeError):
        raise credentials_exception
    
    user = get_user_by_id(db, user_id)

    if user is None:
        raise credentials_exception
    
    return user