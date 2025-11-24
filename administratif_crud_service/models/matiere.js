const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Matiere = sequelize.define('Matiere', {
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    nom: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    id_niveau: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false 
    }
  }, {
    tableName: 'matiere',
    timestamps: false
  });

  Matiere.associate = (models) => {
    Matiere.hasMany(models.Seance, { 
      foreignKey: 'id_matiere', 
      as: 'seances' 
    });
  };

  return Matiere;
};