const { sequelize } = require('../config/database');

const User = require('./User');
const Simulation = require('./Simulation');
const FinancingResult = require('./FinancingResult');
const ConsortiumResult = require('./ConsortiumResult');
const Recommendation = require('./Recommendation');

/**
 * Associações
 * - User 1-N Simulation
 * - Simulation 1-1 FinancingResult / ConsortiumResult / Recommendation
 *
 * `onDelete: CASCADE` garante que, ao remover uma simulação, seus resultados
 * e recomendação sejam removidos junto.
 */

// User 1-N Simulation
User.hasMany(Simulation, { foreignKey: 'userId', as: 'simulations' });
Simulation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Simulation 1-1 FinancingResult
Simulation.hasOne(FinancingResult, {
  foreignKey: 'simulationId',
  as: 'financingResult',
  onDelete: 'CASCADE',
});
FinancingResult.belongsTo(Simulation, {
  foreignKey: 'simulationId',
  as: 'simulation',
});

// Simulation 1-1 ConsortiumResult
Simulation.hasOne(ConsortiumResult, {
  foreignKey: 'simulationId',
  as: 'consortiumResult',
  onDelete: 'CASCADE',
});
ConsortiumResult.belongsTo(Simulation, {
  foreignKey: 'simulationId',
  as: 'simulation',
});

// Simulation 1-1 Recommendation
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
