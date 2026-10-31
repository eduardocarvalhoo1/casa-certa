const OBJECTIVES = require('../config/objectives');
const { CalculationInputError } = require('../utils/errors');

function ratioScore(value, min) {
  if (!(value > 0)) return 0;
  return (min / value) * 100;
}

function timeToPropertyScore(months, horizon) {
  if (!(horizon > 0)) return 0;
  return Math.max(0, 100 * (1 - months / horizon));
}

function calculateRecommendation({ financingResult, consortiumResult, objective }) {
  if (!financingResult || typeof financingResult !== 'object') {
    throw new Error('O resultado do financiamento (financingResult) é obrigatório.');
  }
  if (!consortiumResult || typeof consortiumResult !== 'object') {
    throw new Error('O resultado do consórcio (consortiumResult) é obrigatório.');
  }
  if (!Number.isInteger(consortiumResult.contemplationMonth)) {
    throw new Error('O mês de contemplação (contemplationMonth) do consórcio é obrigatório.');
  }

  const objectiveConfig = OBJECTIVES[objective];
  if (!objectiveConfig) {
    throw new CalculationInputError(
      `O objetivo (objective) deve ser um dos valores: ${Object.keys(OBJECTIVES).join(', ')}.`
    );
  }

  const weights = objectiveConfig.weights;

  const financingMetrics = {
    totalCost: financingResult.totalPaid,
    payoffTerm: financingResult.evolution.length,
    initialPayment: financingResult.initialPayment,
  };

  const consortiumMetrics = {
    totalCost: consortiumResult.totalPaid,
    payoffTerm: consortiumResult.estimatedTermWithBid,
    initialPayment: consortiumResult.monthlyPayment,
  };

  let financingScore = 0;
  let consortiumScore = 0;

  for (const metric of ['totalCost', 'payoffTerm', 'initialPayment']) {
    const min = Math.min(financingMetrics[metric], consortiumMetrics[metric]);
    financingScore += ratioScore(financingMetrics[metric], min) * weights[metric];
    consortiumScore += ratioScore(consortiumMetrics[metric], min) * weights[metric];
  }

  const horizon = consortiumResult.estimatedTermWithBid;
  financingScore += timeToPropertyScore(0, horizon) * weights.timeToProperty;
  consortiumScore +=
    timeToPropertyScore(consortiumResult.contemplationMonth, horizon) * weights.timeToProperty;

  financingScore = Math.round((financingScore + Number.EPSILON) * 100) / 100;
  consortiumScore = Math.round((consortiumScore + Number.EPSILON) * 100) / 100;

  const recommendedOption =
    financingScore >= consortiumScore ? 'FINANCING' : 'CONSORTIUM';

  return {
    recommendedOption,
    financingScore,
    consortiumScore,
    financingWeights: weights,
    consortiumWeights: weights,
  };
}

module.exports = {
  calculateRecommendation,
};
