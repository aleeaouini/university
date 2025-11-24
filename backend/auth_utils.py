import os
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

# ---------------- Configuration ----------------
MAX_BCRYPT_LENGTH = 72
SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# ---------------- Logging ----------------
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------------- Password Context ----------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ---------------- Password Utilities ----------------
def hash_password(password: str) -> str:
    """
    Hash a password safely using bcrypt, truncated to 72 chars.
    """
    truncated = password[:MAX_BCRYPT_LENGTH]
    return pwd_context.hash(truncated)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a password against a bcrypt hash. Supports legacy SHA-256.
    """
    if not hashed:
        return False

    truncated = plain[:MAX_BCRYPT_LENGTH]

    try:
        return pwd_context.verify(truncated, hashed)
    except ValueError:
        # Fallback for legacy SHA-256 hashes
        legacy_sha = hashlib.sha256(plain.encode()).hexdigest()
        return legacy_sha == hashed
    except Exception as e:
        logger.error(f"[verify_password] Unexpected error: {e}")
        return False


# ---------------- JWT Utilities ----------------
def create_access_token(data: dict, expires_delta: Optional[int] = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """
    Create a JWT access token with expiration in minutes.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token. Returns payload or None if invalid.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token has expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid JWT token")
        return None
