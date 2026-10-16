const simulationService = require('../services/simulationService');
const { SimulationValidationError } = require('../services/simulationService');
const { validateSimulationInput } = require('../utils/validation');
const response = require('../utils/response');

async function createSimulation(req, res) {
  const { valid, errors } = validateSimulationInput(req.body);
  if (!valid) {
    return response.badRequest(res, 'Dados inválidos.', errors);
  }

  try {
    const result = await simulationService.createSimulation(req.body);
    return response.success(res, 201, result);
  } catch (err) {
    if (err instanceof SimulationValidationError) {
      return response.badRequest(res, err.message, err.details);
    }
    if (err instanceof Error && err.name && !err.name.includes('Sequelize')) {
      return response.badRequest(res, err.message);
    }
    console.error('Erro ao criar simulação:', err);
    return response.serverError(res, 'Erro interno ao criar simulação.');
  }
}

module.exports = { createSimulation };
