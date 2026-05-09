from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.crud.user import create_user, get_user_by_email
from app.db.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    user_create: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = get_user_by_email(db, str(user_create.email))

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )
    
    user = create_user(db, user_create)

    return user

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    login_request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, str(login_request.email))

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(login_request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )