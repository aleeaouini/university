import os
import logging
import secrets
import string
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_
from email.message import EmailMessage
import aiosmtplib
import asyncio

import models  # uses the uploaded / project models.py
import schemas
import database
import auth_utils
from dotenv import load_dotenv

# ---------------- Environment ----------------
load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_STARTTLS = os.getenv("SMTP_STARTTLS", "True").lower() in ("1", "true", "yes")

# ---------------- Router ----------------
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------- Logging ----------------
logger = logging.getLogger("auth")
logging.basicConfig(level=logging.INFO)

# ---------------- Database Dependency ----------------
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Utilities ----------------
def generate_random_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*()-_"
    return ''.join(secrets.choice(chars) for _ in range(length))


# ---------------- Email Sending ----------------
# This function is safe to run in BackgroundTasks. It is async and uses timeout + simple retry.
async def send_email(to_email: str, subject: str, body: str, timeout: int = 10, retries: int = 1):
    """
    Send an email with a timeout and small retry logic.
    If EMAIL_USER or EMAIL_PASS are not set, log and return (do not raise).
    This prevents blocking user activation if mail fails.
    """
    if not EMAIL_USER or not EMAIL_PASS:
        logger.warning("[send_email] EMAIL_USER or EMAIL_PASS not configured; skipping send.")
        return

    message = EmailMessage()
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    attempt = 0
    while attempt <= retries:
        try:
            # wrap send in asyncio.wait_for to guarantee a hard timeout
            await asyncio.wait_for(
                aiosmtplib.send(
                    message,
                    hostname=SMTP_HOST,
                    port=SMTP_PORT,
                    start_tls=SMTP_STARTTLS,
                    username=EMAIL_USER,
                    password=EMAIL_PASS,
                ),
                timeout=timeout
            )
            logger.info(f"[send_email] Email sent to {to_email}")
            return
        except asyncio.TimeoutError:
            logger.error(f"[send_email] Timeout when sending email to {to_email} (attempt {attempt + 1})")
        except aiosmtplib.errors.SMTPAuthenticationError:
            logger.error(f"[send_email] SMTP authentication failed for {EMAIL_USER}")
            # Authentication errors won't succeed on retry; break.
            break
        except Exception as e:
            logger.exception(f"[send_email] Unexpected error sending to {to_email}: {e}")

        attempt += 1

    logger.warning(f"[send_email] Giving up sending email to {to_email} after {attempt} attempts.")


# ---------------- Signup Endpoint ----------------
@router.post("/signup")
async def signup(req: schemas.SignupRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Activates a pre-created Utilisateur: sets a random password and creates related role rows if missing.
    Email is sent in the background; if email fails, activation still succeeds.
    """
    user = db.query(models.Utilisateur).filter(
        and_(
            models.Utilisateur.cin == req.cin,
            models.Utilisateur.email == req.email
        )
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if user.mdp_hash and user.mdp_hash.strip():
        raise HTTPException(status_code=400, detail="Utilisateur déjà activé")

    # Generate and hash password
    plain_password = generate_random_password(12)
    hashed_password = auth_utils.hash_password(plain_password)
    user.mdp_hash = hashed_password

    # Create role entries if missing
    # keep the minimal fields you had originally; adjust as necessary
    if user.role == "etudiant" and not user.etudiant:
        db.add(models.Etudiant(id=user.id, id_groupe=None, id_specialite=None))
    if user.role == "enseignant" and not user.enseignant:
        db.add(models.Enseignant(id=user.id))
    if user.role == "administratif" and not user.administratif:
        db.add(models.Administratif(id=user.id, poste=None))

    # Commit all changes
    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        logger.exception(f"[signup] DB commit failed: {e}")
        raise HTTPException(status_code=500, detail="Database error during signup")

    # Prepare email body (plain text)
    email_body = f"""Bonjour {user.nom},

Votre compte a été activé avec succès.

Voici vos informations de connexion :
CIN : {user.cin}
Email : {user.email}
Mot de passe : {plain_password}

Veuillez conserver ce mot de passe en lieu sûr.
Cordialement,
L’équipe d’administration.
"""

    # schedule email in the background to avoid blocking
    background.add_task(send_email, user.email, "Activation de votre compte", email_body)

    return {"message": "Compte activé. Un email de confirmation sera envoyé."}


# ---------------- Signin Endpoint ----------------
@router.post("/signin")
def signin(req: schemas.SigninRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user by CIN or email and password.
    - Supports rehashing legacy SHA-256 (len == 64) to new hashing scheme.
    - Returns JWT token with roles.
    """
    try:
        user = db.query(models.Utilisateur).filter(
            (models.Utilisateur.cin == req.cin_or_email) |
            (models.Utilisateur.email == req.cin_or_email)
        ).first()

        if not user or not user.mdp_hash:
            raise HTTPException(status_code=401, detail="Identifiants invalides")

        if not auth_utils.verify_password(req.password, user.mdp_hash):
            raise HTTPException(status_code=401, detail="Identifiants invalides")

        # Rehash legacy SHA passwords (keep your existing heuristic)
        if len(user.mdp_hash) == 64:
            try:
                user.mdp_hash = auth_utils.hash_password(req.password)
                db.commit()
                db.refresh(user)
            except Exception:
                db.rollback()
                logger.exception("[signin] failed to rehash legacy password; continuing")

        # Determine roles
        roles = []
        if user.role == "etudiant":
            roles.append("etudiant")
        if user.role == "enseignant":
            roles.append("enseignant")
            # if the enseignant has a chef relation that indicates "chef", include role
            if getattr(user.enseignant, "chef", None):
                roles.append("chef")
        if user.role == "administratif":
            roles.append("administratif")

        # Create access token
        token = auth_utils.create_access_token({
            "sub": user.email,
             "id": user.id,
             "roles": roles})

        return {
            "access_token": token,
            "token_type": "bearer",
            "roles": roles,
            "user": {
                "id": user.id,
                "email": user.email,
                "phone": user.telp,
                "image": user.image
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[signin] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

