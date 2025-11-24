const { gql } = require('apollo-server-express');

const seanceTypeDefs = gql`
  type Seance {
    id: ID!
    day_of_week: Int
    specific_date: String
    heure_debut: String!
    heure_fin: String!
    id_salle: Int!
    id_matiere: Int!
    id_groupe: Int!
    id_enseignant: Int!
    is_presente: Boolean
    created_by: Int

    salle: Salle
    matiere: Matiere
    groupe: Groupe
    enseignant: Enseignant
  }

  input SeanceInput {
    id: Int
    day_of_week: Int
    specific_date: String
    heure_debut: String!
    heure_fin: String!
    id_salle: Int!
    id_matiere: Int!
    id_groupe: Int!
    id_enseignant: Int!
  }

  type Conflict {
    resource: String!
    seanceId: Int!
    heure_debut: String!
    heure_fin: String!
  }

  type Query {
    getSeancesByGroupe(id_groupe: Int!): [Seance]
    getSeancesByDay(day_of_week: Int!): [Seance]
    getSeances: [Seance]
  }

  type Mutation {
    createSeance(input: SeanceInput!): Seance
    updateSeance(input: SeanceInput!): Seance
    deleteSeance(id: Int!): Boolean
    checkSeanceConflict(input: SeanceInput!): [Conflict]
  }
     type Enseignant {
    id: ID!
    nom: String
    prenom: String
    seances: [Seance]
  }

  type Salle {
    id: ID!
    numero: String
    nom: String
    type: String
    capacite: Int
    seances: [Seance]
  }

  type Matiere {
    id: ID!
    nom: String
    id_niveau: Int
    seances: [Seance]
  }

  type Groupe {
    id: ID!
    nom: String
    id_niveau: Int
    seances: [Seance]
  }

  type Absence {
    id: ID!
    seance: Seance
    id_seance: Int
    id_etudiant: Int
    justifiee: Boolean
  }
`;

module.exports = seanceTypeDefs;
