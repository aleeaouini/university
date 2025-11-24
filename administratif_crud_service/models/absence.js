const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Absence = sequelize.define('Absence', {
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_seance: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false 
    },
    id_etudiant: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false 
    },
    justifiee: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    }
  }, {
    tableName: 'absence',
    timestamps: false
  });

  Absence.associate = (models) => {
    Absence.belongsTo(models.Seance, { 
      foreignKey: 'id_seance', 
      as: 'seance' 
    });
  };

  return Absence;
};