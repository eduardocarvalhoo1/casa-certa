const { sequelize } = require('../config/database');

const User = require('./User');
const Simulation = require('./Simulation');
const FinancingResult = require('./FinancingResult');
const ConsortiumResult = require('./ConsortiumResult');
const Recommendation = require('./Recommendation');

User.hasMany(Simulation, { foreignKey: 'userId', as: 'simulations' });
Simulation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Simulation.hasOne(FinancingResult, {
  foreignKey: 'simulationId',
  as: 'financingResult',
  onDelete: 'CASCADE',
});
FinancingResult.belongsTo(Simulation, {
  foreignKey: 'simulationId',
  as: 'simulation',
});

Simulation.hasOne(ConsortiumResult, {
  foreignKey: 'simulationId',
  as: 'consortiumResult',
  onDelete: 'CASCADE',
});
ConsortiumResult.belongsTo(Simulation, {
  foreignKey: 'simulationId',
  as: 'simulation',
});

Simulation.hasOne(Recommendation, {
  foreignKey: 'simulationId',
  as: 'recommendation',
  onDelete: 'CASCADE',
});
Recommendation.belongsTo(Simulation, {
  foreignKey: 'simulationId',
  as: 'simulation',
});

module.exports = {
  sequelize,
  User,
  Simulation,
  FinancingResult,
  ConsortiumResult,
  Recommendation,
};
