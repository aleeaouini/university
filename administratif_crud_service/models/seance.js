const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Seance = sequelize.define('Seance', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },

    day_of_week: { type: DataTypes.TINYINT, allowNull: true }, // 0 = Sunday, 6 = Saturday
    specific_date: { type: DataTypes.DATEONLY, allowNull: true }, // nullable for recurring

    heure_debut: { type: DataTypes.TIME, allowNull: false },
    heure_fin: { type: DataTypes.TIME, allowNull: false },

    id_salle: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_matiere: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_groupe: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_enseignant: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    is_presente: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true } // optional
  }, {
    tableName: 'seance',
    timestamps: false,
  });

  Seance.associate = (models) => {
    Seance.belongsTo(models.Salle, { foreignKey: 'id_salle', as: 'salle' });
    Seance.belongsTo(models.Matiere, { foreignKey: 'id_matiere', as: 'matiere' });
    Seance.belongsTo(models.Groupe, { foreignKey: 'id_groupe', as: 'groupe' });
    Seance.belongsTo(models.Enseignant, { foreignKey: 'id_enseignant', as: 'enseignant' });
    Seance.hasMany(models.Absence, { foreignKey: 'id_seance', as: 'absences' });
  };

  return Seance;
};
