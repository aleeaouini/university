from pydantic import BaseModel, EmailStr
from typing import Optional




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

    class Config:
        orm_mode = True




class EtudiantResponse(BaseModel):
    id: int
    id_groupe: int
    id_specialite: int

    class Config:
        orm_mode = True




class EnseignantResponse(BaseModel):
    id: int
    id_departement: int

    class Config:
        orm_mode = True



class ChefResponse(BaseModel):
    id: int
    date_nomination: Optional[str] = None

    class Config:
        orm_mode = True



class AdministratifResponse(BaseModel):
    id: int
    poste: Optional[str] = None

    class Config:
        orm_mode = True
