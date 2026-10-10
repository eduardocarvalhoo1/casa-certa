const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Recommendation
 * Resultado do scoring ponderado por objetivo de uma simulação.
 * `recommendedOption` indica a melhor opção (ex.: FINANCING ou CONSORTIUM).
 * Os pesos aplicados ficam serializados como JSON string.
 */
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

    // Pesos aplicados ao financiamento, como JSON string
    financingWeights: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Pesos aplicados ao consórcio, como JSON string
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
