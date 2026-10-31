const { calculateFinancing, round2 } = require('./financingService');
const { calculateConsortium } = require('./consortiumService');
const { calculateRecommendation } = require('./recommendationService');
const simulationRepository = require('../repositories/simulationRepository');

class SimulationValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'SimulationValidationError';
    this.details = details;
  }
}

class SimulationNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SimulationNotFoundError';
  }
}

function parseJSON(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}

function toNumberOrNull(value) {
  return value === null || value === undefined ? null : Number(value);
}

function buildComparison({ financingResult, consortiumResult, financingInput, consortiumInput }) {
  const { initialBid } = consortiumInput;
  const { ownResources } = consortiumResult;
  const consortiumOwnMoney =
    initialBid === null || ownResources === null ? null : round2(initialBid + ownResources);

  return {
    initialPayment: {
      financing: financingResult.initialPayment,
      consortium: consortiumResult.monthlyPayment,
    },
    totalCost: {
      financing: financingResult.totalPaid,
      consortium: consortiumResult.totalPaid,
    },
    interestOrTaxes: {
      financing: financingResult.totalInterest,
      consortium: consortiumResult.totalTaxes,
    },
    timeframe: {
      financing: financingResult.evolution.length,
      consortium: consortiumResult.estimatedTermWithBid,
    },
    timeToProperty: {
      financing: 0,
      consortium: consortiumResult.contemplationMonth ?? null,
    },
    downPaymentOrBid: {
      financing: financingInput.downPayment,
      consortium: consortiumOwnMoney,
    },
  };
}

async function createSimulation(input) {
  const { userId, name, objective, system, propertyValue, financing, consortium } = input;

  const user = await simulationRepository.findUserById(userId);
  if (!user) {
    throw new SimulationValidationError('Usuário não encontrado.', [
      `Nenhum usuário com id ${userId}.`,
    ]);
  }

  const loanTermMonths = financing.termYears * 12;

  const financingResult = calculateFinancing({
    propertyValue,
    downPayment: financing.downPayment,
    loanTermMonths,
    interestRateAnnual: financing.interestRateAnnual,
    system,
  });

  const consortiumResult = calculateConsortium({
    creditValue: consortium.creditValue,
    loanTermMonths: consortium.termMonths,
    adminRateTotal: consortium.adminRateTotal,
    reserveFund: consortium.reserveFund,
    initialBid: consortium.initialBid,
    propertyValue,
    contemplationMonth: consortium.contemplationMonth,
  });

  const recommendation = calculateRecommendation({
    financingResult,
    consortiumResult,
    objective,
  });

  const storedInput = {
    financing: {
      downPayment: financing.downPayment,
      termYears: financing.termYears,
      interestRateAnnual: financing.interestRateAnnual,
    },
    consortium: {
      creditValue: consortium.creditValue,
      termMonths: consortium.termMonths,
      adminRateTotal: consortium.adminRateTotal,
      reserveFund: consortium.reserveFund,
      initialBid: consortium.initialBid ?? 0,
    },
  };

  const created = await simulationRepository.createWithResults({
    simulation: { name, objective, system, propertyValue, userId },
    financingInput: storedInput.financing,
    consortiumInput: storedInput.consortium,
    financingResult,
    consortiumResult,
    recommendation,
  });

  const comparison = buildComparison({
    financingResult,
    consortiumResult,
    financingInput: storedInput.financing,
    consortiumInput: storedInput.consortium,
  });

  return {
    simulation: {
      id: created.id,
      name: created.name,
      objective: created.objective,
      system: created.system,
      propertyValue: Number(created.propertyValue),
      userId: created.userId,
      createdAt: created.createdAt,
    },
    input: storedInput,
    financingResult,
    consortiumResult,
    recommendation,
    comparison,
  };
}

async function listSimulations(userId) {
  const simulations = await simulationRepository.findAllByUser(userId);

  return simulations.map((s) => ({
    id: s.id,
    name: s.name,
    objective: s.objective,
    propertyValue: Number(s.propertyValue),
    createdAt: s.createdAt,
    recommendedOption: s.recommendation ? s.recommendation.recommendedOption : null,
  }));
}

async function getSimulation(id, userId) {
  const s = await simulationRepository.findByIdAndUser(id, userId);
  if (!s) {
    throw new SimulationNotFoundError('Simulação não encontrada.');
  }

  const financing = s.financingResult;
  const consortium = s.consortiumResult;
  const recommendation = s.recommendation;

  const input = {
    financing: financing && {
      downPayment: toNumberOrNull(financing.downPayment),
      termYears: financing.termYears ?? null,
      interestRateAnnual: toNumberOrNull(financing.interestRateAnnual),
    },
    consortium: consortium && {
      creditValue: toNumberOrNull(consortium.creditValue),
      termMonths: consortium.termMonths ?? null,
      adminRateTotal: toNumberOrNull(consortium.adminRateTotal),
      reserveFund: toNumberOrNull(consortium.reserveFund),
      initialBid: toNumberOrNull(consortium.initialBid),
    },
  };

  const financingResult = financing && {
    financeAmount: Number(financing.financeAmount),
    initialPayment: Number(financing.initialPayment),
    finalPayment: Number(financing.finalPayment),
    totalPaid: Number(financing.totalPaid),
    totalInterest: Number(financing.totalInterest),
    evolution: parseJSON(financing.evolution, []),
  };

  const consortiumResult = consortium && {
    monthlyPayment: Number(consortium.monthlyPayment),
    ownResources: toNumberOrNull(consortium.ownResources),
    totalPaid: Number(consortium.totalPaid),
    totalTaxes: Number(consortium.totalTaxes),
    estimatedTermWithBid: consortium.estimatedTermWithBid,
    contemplationMonth: consortium.contemplationMonth ?? null,
    evolution: parseJSON(consortium.evolution, []),
  };

  const comparison =
    financingResult && consortiumResult
      ? buildComparison({
          financingResult,
          consortiumResult,
          financingInput: input.financing,
          consortiumInput: input.consortium,
        })
      : null;

  return {
    simulation: {
      id: s.id,
      name: s.name,
      objective: s.objective,
      system: s.system,
      propertyValue: Number(s.propertyValue),
      userId: s.userId,
      createdAt: s.createdAt,
    },
    input,
    financingResult,
    consortiumResult,
    comparison,
    recommendation: recommendation && {
      recommendedOption: recommendation.recommendedOption,
      financingScore: Number(recommendation.financingScore),
      consortiumScore: Number(recommendation.consortiumScore),
      financingWeights: parseJSON(recommendation.financingWeights, {}),
      consortiumWeights: parseJSON(recommendation.consortiumWeights, {}),
    },
  };
}

async function deleteSimulation(id, userId) {
  const deleted = await simulationRepository.deleteByIdAndUser(id, userId);
  if (!deleted) {
    throw new SimulationNotFoundError('Simulação não encontrada.');
  }
}

module.exports = {
  createSimulation,
  listSimulations,
  getSimulation,
  deleteSimulation,
  SimulationValidationError,
  SimulationNotFoundError,
};
