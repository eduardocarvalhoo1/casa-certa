const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Simulation
 * Representa uma simulação criada por um usuário, agregando os dados de
 * entrada do imóvel e os parâmetros gerais. Os resultados de financiamento,
 * consórcio e a recomendação ficam em tabelas associadas (1-1).
 */
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

    // Objetivo da simulação (ex.: COMPRAR_IMOVEL, INVESTIR, REFINANCIAR)
    objective: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    // Sistema de amortização do financiamento escolhido: SAC ou PRICE
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
