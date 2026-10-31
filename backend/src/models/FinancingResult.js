const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FinancingResult = sequelize.define(
  'FinancingResult',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    financeAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    initialPayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    finalPayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    totalPaid: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    totalInterest: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },

    downPayment: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    termYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    interestRateAnnual: {
      type: DataTypes.DECIMAL(9, 6),
      allowNull: true,
    },

    // Array de { month, payment, interest, amortization, balance } como JSON string
    evolution: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'financing_results',
    timestamps: true,
  }
);

module.exports = FinancingResult;
