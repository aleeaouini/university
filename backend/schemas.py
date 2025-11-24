from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date





class SignupRequest(BaseModel):
    cin: str
    email: EmailStr


class SigninRequest(BaseModel):
    cin_or_email: str
    password: str




class UserResponse(BaseModel):
    id: int
    cin: str
    nom: str
    prenom: str
    email: EmailStr
    telp: Optional[str] = None
    image: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True




class EtudiantResponse(BaseModel):
    id: int
    id_groupe: int
    id_specialite: int

    class Config:
        from_attributes = True




class EnseignantResponse(BaseModel):
    id: int
    id_departement: int

    class Config:
        from_attributes = True



class ChefResponse(BaseModel):
    id: int
    date_nomination: Optional[str] = None

    class Config:
        from_attributes = True



class AdministratifResponse(BaseModel):
    id: int
    poste: Optional[str] = None

    class Config:
        from_attributes = True

class MessEnsAbsCreate(BaseModel):
    id_enseignant: int
    id_chef: int                 
    contenu: str
    id_seance: Optional[int] = None
    file_path: Optional[str] = None
    date: date
