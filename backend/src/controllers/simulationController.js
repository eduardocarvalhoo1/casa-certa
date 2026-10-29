const simulationService = require('../services/simulationService');
const {
  SimulationValidationError,
  SimulationNotFoundError,
} = require('../services/simulationService');
const { validateSimulationInput, isPositiveInteger } = require('../utils/validation');
const response = require('../utils/response');

async function createSimulation(req, res) {
  const { valid, errors } = validateSimulationInput(req.body);
  if (!valid) {
    return response.badRequest(res, 'Dados inválidos.', errors);
  }

  try {
    const result = await simulationService.createSimulation({
      ...req.body,
      userId: req.user.id,
    });
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

async function listSimulations(req, res) {
  try {
    const simulations = await simulationService.listSimulations(req.user.id);
    return response.success(res, 200, simulations);
  } catch (err) {
    console.error('Erro ao listar simulações:', err);
    return response.serverError(res, 'Erro interno ao listar simulações.');
  }
}

async function getSimulation(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveInteger(id)) {
    return response.badRequest(res, 'O parâmetro "id" deve ser um inteiro positivo.');
  }

  try {
    const result = await simulationService.getSimulation(id, req.user.id);
    return response.success(res, 200, result);
  } catch (err) {
    if (err instanceof SimulationNotFoundError) {
      return response.notFound(res, err.message);
    }
    console.error('Erro ao buscar simulação:', err);
    return response.serverError(res, 'Erro interno ao buscar simulação.');
  }
}

async function deleteSimulation(req, res) {
  const id = Number(req.params.id);
  if (!isPositiveInteger(id)) {
    return response.badRequest(res, 'O parâmetro "id" deve ser um inteiro positivo.');
  }

  try {
    await simulationService.deleteSimulation(id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    if (err instanceof SimulationNotFoundError) {
      return response.notFound(res, err.message);
    }
    console.error('Erro ao excluir simulação:', err);
    return response.serverError(res, 'Erro interno ao excluir simulação.');
  }
}

module.exports = { createSimulation, listSimulations, getSimulation, deleteSimulation };
