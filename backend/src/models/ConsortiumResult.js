const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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

    estimatedTermWithBid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

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
