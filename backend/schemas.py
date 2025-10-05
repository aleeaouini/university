from pydantic import BaseModel, EmailStr
from typing import Optional, List


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
    is_chef: bool
    is_admin: bool

    class Config:
        orm_mode = True
