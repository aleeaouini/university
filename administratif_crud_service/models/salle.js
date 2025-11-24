const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Salle = sequelize.define('Salle', {
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    numero: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    nom: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    type: { 
      type: DataTypes.ENUM('cours', 'tp', 'amphi'), 
      defaultValue: 'cours' 
    },
    capacite: { 
      type: DataTypes.INTEGER, 
      defaultValue: 30 
    }
  }, {
    tableName: 'salle',
    timestamps: false
  });

  Salle.associate = (models) => {
    Salle.hasMany(models.Seance, { 
      foreignKey: 'id_salle', 
      as: 'seances' 
    });
  };

  return Salle;
};