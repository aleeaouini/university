const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Enseignant = sequelize.define('Enseignant', {
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nom: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    prenom: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    }
  }, {
    tableName: 'enseignant',
    timestamps: false
  });

  Enseignant.associate = (models) => {
    Enseignant.hasMany(models.Seance, { 
      foreignKey: 'id_enseignant', 
      as: 'seances' 
    });
  };

  return Enseignant;
};