const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Groupe = sequelize.define('Groupe', {
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
    tableName: 'groupe',
    timestamps: false
  });

  Groupe.associate = (models) => {
    Groupe.hasMany(models.Seance, { 
      foreignKey: 'id_groupe', 
      as: 'seances' 
    });
  };

  return Groupe;
};