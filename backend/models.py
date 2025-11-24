from sqlalchemy import Index
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Boolean, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy import Table, Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    prenom = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    cin = Column(Integer, unique=True, nullable=False)
    telp = Column(String(20), nullable=True)
    image = Column(String(255), nullable=True)
    mdp_hash = Column(String(255), nullable=True)
    role = Column(String(20), nullable=False)

    etudiant = relationship("Etudiant", back_populates="utilisateur", uselist=False)
    enseignant = relationship("Enseignant", back_populates="utilisateur", uselist=False)
    administratif = relationship("Administratif", back_populates="utilisateur", uselist=False)


class Etudiant(Base):
    __tablename__ = "etudiant"

    id = Column(Integer, ForeignKey("utilisateur.id"), primary_key=True)
    id_groupe = Column(Integer, ForeignKey("groupe.id"), nullable=True)
    id_specialite = Column(Integer, ForeignKey("specialite.id"), nullable=True)

    utilisateur = relationship("Utilisateur", back_populates="etudiant")
    groupe = relationship("Groupe", back_populates="etudiants")
    specialite = relationship("Specialite", back_populates="etudiants")


class Enseignant(Base):
    __tablename__ = "enseignant"

    id = Column(Integer, ForeignKey("utilisateur.id"), primary_key=True)

    utilisateur = relationship("Utilisateur", back_populates="enseignant")
    chef = relationship("Chef", back_populates="enseignant", uselist=False)
    seances = relationship("Seance", back_populates="enseignant")



class Chef(Base):
    __tablename__ = "chef"

    id = Column(Integer, ForeignKey("enseignant.id"), primary_key=True)
    date_nomination = Column(String(50), nullable=True)

    enseignant = relationship("Enseignant", back_populates="chef")
    departements = relationship("Departement", back_populates="chef")


class Administratif(Base):
    __tablename__ = "administratif"

    id = Column(Integer, ForeignKey("utilisateur.id"), primary_key=True)
    poste = Column(String(100), nullable=True)

    utilisateur = relationship("Utilisateur", back_populates="administratif")


class Departement(Base):
    __tablename__ = "departement"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, nullable=False)
    id_chef = Column(Integer, ForeignKey("chef.id"), nullable=True)

    specialites = relationship("Specialite", back_populates="departement")
    chef = relationship("Chef", back_populates="departements")


class Specialite(Base):
    __tablename__ = "specialite"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=False, nullable=False)
    id_departement = Column(Integer, ForeignKey("departement.id"), nullable=False)
    

    departement = relationship("Departement", back_populates="specialites")
    niveaux = relationship("Niveau", back_populates="specialite")
    etudiants = relationship("Etudiant", back_populates="specialite")


class Niveau(Base):
    __tablename__ = "niveau"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), unique=False, nullable=False)
    id_specialite = Column(Integer, ForeignKey("specialite.id"), nullable=False)

    specialite = relationship("Specialite", back_populates="niveaux")
    groupes = relationship("Groupe", back_populates="niveau")
    matieres = relationship("Matiere", back_populates="niveau")



class Groupe(Base):
    __tablename__ = "groupe"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(50), nullable=False)
    id_niveau = Column(Integer, ForeignKey("niveau.id"), nullable=False)

    niveau = relationship("Niveau", back_populates="groupes")
    etudiants = relationship("Etudiant", back_populates="groupe")
    seances = relationship("Seance", back_populates="groupe")



class Matiere(Base):
    __tablename__ = "matiere"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    id_niveau = Column(Integer, ForeignKey("niveau.id"), nullable=False)

    niveau = relationship("Niveau", back_populates="matieres")
    seances = relationship("Seance", back_populates="matiere")


class Salle(Base):
    __tablename__ = "salle"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(50), nullable=False)
    type = Column(String(100), nullable=False, default="cours")
    capacite = Column(Integer, nullable=False, default=30)

    seances = relationship("Seance", back_populates="salle")
class Seance(Base):
    __tablename__ = "seance"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer, nullable=True)
    specific_date = Column(Date, nullable=True)   
    heure_debut = Column(Time, nullable=False)
    heure_fin = Column(Time, nullable=False)

   
    id_salle = Column(Integer, ForeignKey("salle.id"), nullable=False)
    id_matiere = Column(Integer, ForeignKey("matiere.id"), nullable=False)
    id_groupe = Column(Integer, ForeignKey("groupe.id"), nullable=False)
    id_enseignant = Column(Integer, ForeignKey("enseignant.id"), nullable=False)

    
    created_by = Column(Integer, ForeignKey("utilisateur.id"), nullable=True)

    is_presente = Column(Boolean, default=False)

    salle = relationship("Salle", back_populates="seances")
    matiere = relationship("Matiere", back_populates="seances")
    groupe = relationship("Groupe", back_populates="seances")
    enseignant = relationship("Enseignant", back_populates="seances")
    absences = relationship("Absence", back_populates="seance")

    __table_args__ = (
        
        Index('ix_seance_salle_day', 'id_salle', 'day_of_week'),
        Index('ix_seance_enseignant_day', 'id_enseignant', 'day_of_week'),
        Index('ix_seance_groupe_day', 'id_groupe', 'day_of_week'),
        Index('ix_seance_specific_date', 'specific_date'),
    )


class Absence(Base):
    __tablename__ = "absence"

    id = Column(Integer, primary_key=True, index=True)
    id_etudiant = Column(Integer, ForeignKey("etudiant.id"), nullable=False)
    id_seance = Column(Integer, ForeignKey("seance.id"), nullable=False)

   
    date = Column(Date, nullable=False)

    statut = Column(String(20), nullable=False)

    etudiant = relationship("Etudiant")
    seance = relationship("Seance", back_populates="absences")

class Message(Base):
    __tablename__ = "message"

    id = Column(Integer, primary_key=True, index=True)
    id_expediteur = Column(Integer, ForeignKey("utilisateur.id"), nullable=False)
    id_destinataire = Column(Integer, ForeignKey("utilisateur.id"), nullable=False)

    contenu = Column(String(1000), nullable=False)
    date = Column(Date, nullable=False)

    expediteur = relationship("Utilisateur", foreign_keys=[id_expediteur])
    destinataire = relationship("Utilisateur", foreign_keys=[id_destinataire])



# Association table for students registering for events
evenement_etudiants = Table(
    "evenement_etudiants",
    Base.metadata,
    Column("evenement_id", Integer, ForeignKey("evenement.id"), primary_key=True),
    Column("etudiant_id", Integer, ForeignKey("etudiant.id"), primary_key=True),
)

# Association table for teachers registering for events
evenement_enseignants = Table(
    "evenement_enseignants",
    Base.metadata,
    Column("evenement_id", Integer, ForeignKey("evenement.id"), primary_key=True),
    Column("enseignant_id", Integer, ForeignKey("enseignant.id"), primary_key=True),
)

class Evenement(Base):
    __tablename__ = "evenement"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String(1000), nullable=True)
    
    created_by_id = Column(Integer, ForeignKey("administratif.id"), nullable=False)
    created_by = relationship("Administratif", backref="evenements_created")

    # Many-to-many relationships
    etudiants = relationship("Etudiant", secondary=evenement_etudiants, backref="evenements")
    enseignants = relationship("Enseignant", secondary=evenement_enseignants, backref="evenements")

class MessEnsAbs(Base):
    __tablename__ = "mess_ens_abs"

    id = Column(Integer, primary_key=True, index=True)
    
    id_enseignant = Column(Integer, ForeignKey("enseignant.id"), nullable=False)
    id_chef = Column(Integer, ForeignKey("chef.id"), nullable=False)   
    id_seance = Column(Integer, ForeignKey("seance.id"), nullable=True)  
    
    contenu = Column(String(1000), nullable=False)
    file_path = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)

    enseignant = relationship("Enseignant", backref="messages_abs")
    chef = relationship("Chef", backref="messages_abs")   
    seance = relationship("Seance", backref="messages_abs")