
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'O nome é obrigatório.',
        },
      },
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Este e-mail já está cadastrado.',
      },
      validate: {
        notEmpty: {
          msg: 'O e-mail é obrigatório.',
        },
        isEmail: {
          msg: 'Informe um e-mail válido.',
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A senha é obrigatória.',
        },
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

module.exports = User;
