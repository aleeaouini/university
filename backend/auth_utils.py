import os
import hashlib
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

MAX_BCRYPT_LENGTH = 72
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    truncated = password[:MAX_BCRYPT_LENGTH]
    return pwd_context.hash(truncated)


def verify_password(plain: str, hashed: str) -> bool:
    if not hashed:
        return False

    truncated = plain[:MAX_BCRYPT_LENGTH]

    try:
        return pwd_context.verify(truncated, hashed)
    except ValueError:
        
        legacy_sha = hashlib.sha256(plain.encode()).hexdigest()
        return legacy_sha == hashed
    except Exception as e:
        print(f"[verify_password] Error: {e}")
        return False


def create_access_token(data: dict, expires_delta: int = 30) -> str:
    
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
