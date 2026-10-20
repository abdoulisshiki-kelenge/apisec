from collections import defaultdict
from threading import Lock
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, TokenResponse, UserCreate, UserPublic
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(tags=["authentification"])
_attempts: dict[str, list[float]] = defaultdict(list)
_attempts_lock = Lock()
MAX_FAILURES = 8
WINDOW_SECONDS = 15 * 60


def check_login_limit(client_key: str) -> bool:
    now = time.monotonic()
    with _attempts_lock:
        recent = [stamp for stamp in _attempts[client_key] if now - stamp < WINDOW_SECONDS]
        _attempts[client_key] = recent
        return len(recent) < MAX_FAILURES


def record_failure(client_key: str) -> None:
    with _attempts_lock:
        _attempts[client_key].append(time.monotonic())
        # Bound memory use if the application is exposed to many distinct IPs.
        if len(_attempts) > 10_000:
            _attempts.clear()


@router.post("/auth/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    email = payload.email
    username = payload.username
    exists = db.scalar(select(User.id).where((User.email == email) | (User.username == username)))
    if exists:
        raise HTTPException(status_code=409, detail="Adresse e-mail ou nom d’utilisateur déjà utilisé.")
    user = User(email=email, username=username, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    client_key = request.client.host if request.client else "unknown"
    if not check_login_limit(client_key):
        raise HTTPException(status_code=429, detail="Trop de tentatives. Réessayez dans quelques minutes.")

    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        record_failure(client_key)
        raise HTTPException(status_code=401, detail="Identifiants incorrects.")

    with _attempts_lock:
        _attempts.pop(client_key, None)
    expires_in = get_settings().access_token_minutes * 60
    return TokenResponse(access_token=create_access_token(user), expires_in=expires_in)
