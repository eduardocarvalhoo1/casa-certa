const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Simulation = sequelize.define(
  'Simulation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'O nome da simulação é obrigatório.' },
      },
    },

    objective: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    system: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },

    propertyValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: 'simulations',
    timestamps: true,
  }
);

module.exports = Simulation;
