const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'platforme',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const Seance = require('./seance')(sequelize);
const Salle = require('./salle')(sequelize);
const Matiere = require('./matiere')(sequelize);
const Groupe = require('./groupe')(sequelize);
const Enseignant = require('./enseignant')(sequelize);
const Absence = require('./absence')(sequelize);

// Store models in an object
const models = {
  Seance,
  Salle,
  Matiere,
  Groupe,
  Enseignant,
  Absence,
  sequelize,
  Sequelize
};

// Run associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;