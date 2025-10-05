from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    cin = Column(Integer, unique=True, nullable=False)
    mdp_hash = Column(String(255), nullable=True)

    etudiant = relationship("Etudiant", back_populates="utilisateur", uselist=False)
    enseignant = relationship("Enseignant", back_populates="utilisateur", uselist=False)


class Etudiant(Base):
    __tablename__ = "etudiant"

    id = Column(Integer, ForeignKey("utilisateur.id"), primary_key=True)
    id_groupe = Column(Integer, ForeignKey("groupe.id"), nullable=False)
    id_specialite = Column(Integer, ForeignKey("specialite.id"), nullable=False)

    utilisateur = relationship("Utilisateur", back_populates="etudiant")
    groupe = relationship("Groupe", back_populates="etudiants")
    specialite = relationship("Specialite", back_populates="etudiants")



class Enseignant(Base):
    __tablename__ = "enseignant"

    id = Column(Integer, ForeignKey("utilisateur.id"), primary_key=True)
    id_departement = Column(Integer, ForeignKey("departement.id"), nullable=False)
    is_chef = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

    utilisateur = relationship("Utilisateur", back_populates="enseignant")
    departement = relationship("Departement", back_populates="enseignants")



class Departement(Base):
    __tablename__ = "departement"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, nullable=False)

    enseignants = relationship("Enseignant", back_populates="departement")
    specialites = relationship("Specialite", back_populates="departement")



class Specialite(Base):
    __tablename__ = "specialite"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, nullable=False)
    id_departement = Column(Integer, ForeignKey("departement.id"))

    departement = relationship("Departement", back_populates="specialites")
    groupes = relationship("Groupe", back_populates="specialite")
    etudiants = relationship("Etudiant", back_populates="specialite")



class Niveau(Base):
    __tablename__ = "niveau"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), unique=True, nullable=False)

    groupes = relationship("Groupe", back_populates="niveau")



class Groupe(Base):
    __tablename__ = "groupe"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    id_niveau = Column(Integer, ForeignKey("niveau.id"))
    id_specialite = Column(Integer, ForeignKey("specialite.id"))

    niveau = relationship("Niveau", back_populates="groupes")
    specialite = relationship("Specialite", back_populates="groupes")
    etudiants = relationship("Etudiant", back_populates="groupe")
