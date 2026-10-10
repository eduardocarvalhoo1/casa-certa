const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Recommendation = sequelize.define(
  'Recommendation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    recommendedOption: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    financingScore: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },

    consortiumScore: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },

    financingWeights: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    consortiumWeights: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'recommendations',
    timestamps: true,
  }
);

module.exports = Recommendation;
