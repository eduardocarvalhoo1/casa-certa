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

    contemplationMonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    ownResources: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    creditValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    termMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    adminRateTotal: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },

    reserveFund: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },

    initialBid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
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
