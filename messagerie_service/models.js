require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");


// ----- CONNEXION MYSQL -----
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "mysql"
    }
);

// ----- MODEL Message (identique à ta BD existante) -----
const Utilisateur = sequelize.define("utilisateur", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
}, {
    tableName: "utilisateur",
    timestamps: false
});

const Message = sequelize.define("message", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_expediteur: { type: DataTypes.INTEGER, allowNull: false },
    id_destinataire: { type: DataTypes.INTEGER, allowNull: false },
    contenu: { type: DataTypes.STRING(1000), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false }
}, {
    tableName: "message",
    timestamps: false
});

// Associations
Message.belongsTo(Utilisateur, { as: "expediteur", foreignKey: "id_expediteur" });
Message.belongsTo(Utilisateur, { as: "destinataire", foreignKey: "id_destinataire" });

// ⚠️ IMPORTANT : pas de sync() pour ne rien modifier en BD
module.exports = { sequelize, Message, Utilisateur };

