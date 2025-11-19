import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from email.message import EmailMessage
import aiosmtplib
import models, schemas, database, auth_utils
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def send_email(to_email: str, subject: str, body: str):
    if not EMAIL_USER or not EMAIL_PASS:
        raise RuntimeError("EMAIL_USER or EMAIL_PASS is not set")

    message = EmailMessage()
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_USER,
        password=EMAIL_PASS
    )


def generate_random_password(length: int = 10):
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))


@router.post("/signup")
async def signup(req: schemas.SignupRequest, db: Session = Depends(get_db)):
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

    # Generate password
    plain_password = generate_random_password(12)
    plain_password = plain_password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    hashed_password = auth_utils.hash_password(plain_password)
    user.mdp_hash = hashed_password
    db.commit()
    db.refresh(user)

    # Insert into role table with nullable fields if not exists
    if user.role == "etudiant" and not user.etudiant:
        new_etudiant = models.Etudiant(id=user.id, id_groupe=None, id_specialite=None)
        db.add(new_etudiant)

    if user.role == "enseignant" and not user.enseignant:
        new_enseignant = models.Enseignant(id=user.id, id_departement=None)
        db.add(new_enseignant)

    if user.role == "administratif" and not user.administratif:
        new_admin = models.Administratif(id=user.id, poste=None)
        db.add(new_admin)

    db.commit()
    db.refresh(user)

    # Send email
    body = f"""
Bonjour {user.nom},

Votre compte a été activé avec succès

Voici vos informations de connexion :
 CIN : {user.cin}
 Email : {user.email}
 Mot de passe : {plain_password}

Veuillez conserver ce mot de passe en lieu sûr.
Cordialement,
L’équipe d’administration.
"""
    
    await send_email(user.email, "Activation de votre compte", body)
    return {"message": "Compte activé et mot de passe envoyé par email"}


@router.post("/signin")
def signin(req: schemas.SigninRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.Utilisateur).filter(
            (models.Utilisateur.cin == req.cin_or_email) |
            (models.Utilisateur.email == req.cin_or_email)
        ).first()

        if not user or not user.mdp_hash:
            raise HTTPException(status_code=401, detail="Identifiants invalides")

        if not auth_utils.verify_password(req.password, user.mdp_hash):
            raise HTTPException(status_code=401, detail="Identifiants invalides")

        # Rehash legacy SHA passwords
        if len(user.mdp_hash) == 64:
            user.mdp_hash = auth_utils.hash_password(req.password)
            db.commit()
            db.refresh(user)

        # Determine roles
        roles = []
        if user.role == "etudiant":
            roles.append("etudiant")
        if user.role == "enseignant":
            roles.append("enseignant")
            if getattr(user.enseignant, "chef", None):
                roles.append("chef")
        if user.role == "administratif":
            roles.append("administratif")

        # Create token
        token = auth_utils.create_access_token({"sub": user.email, "roles": roles})

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
        print(f"[signin] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
