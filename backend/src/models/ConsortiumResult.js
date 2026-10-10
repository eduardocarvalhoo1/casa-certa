const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ConsortiumResult
 * Resultado do cálculo de consórcio de uma simulação. O lance inicial, quando
 * informado, reduz o prazo — refletido em `estimatedTermWithBid`.
 * `evolution` guarda o array do saldo devedor serializado como JSON string.
 */
const ConsortiumResult = sequelize.define(
  'ConsortiumResult',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    monthlyPayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    totalPaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    totalTaxes: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    // Prazo estimado considerando o lance (= prazo original se sem lance)
    estimatedTermWithBid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Array de { month, payment, balance } como JSON string
    evolution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'consortium_results',
    timestamps: true,
  }
);

module.exports = ConsortiumResult;
