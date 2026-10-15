const OBJECTIVES = require('../config/objectives');

function ratioScore(value, min) {
  if (!(value > 0)) return 0;
  return (min / value) * 100;
}

function calculateRecommendation({ financingResult, consortiumResult, objective }) {
  if (!financingResult || typeof financingResult !== 'object') {
    throw new Error('O resultado do financiamento (financingResult) é obrigatório.');
  }
  if (!consortiumResult || typeof consortiumResult !== 'object') {
    throw new Error('O resultado do consórcio (consortiumResult) é obrigatório.');
  }

  const objectiveConfig = OBJECTIVES[objective];
  if (!objectiveConfig) {
    throw new Error(
      `O objetivo (objective) deve ser um dos valores: ${Object.keys(OBJECTIVES).join(', ')}.`
    );
  }

  const weights = objectiveConfig.weights;

  const financingMetrics = {
    totalCost: financingResult.totalPaid,
    timeframe: financingResult.evolution.length,
    initialPayment: financingResult.initialPayment,
  };

  const consortiumMetrics = {
    totalCost: consortiumResult.totalPaid,
    timeframe: consortiumResult.estimatedTermWithBid,
    initialPayment: consortiumResult.monthlyPayment,
  };

  const metrics = ['totalCost', 'timeframe', 'initialPayment'];

  let financingScore = 0;
  let consortiumScore = 0;

  for (const metric of metrics) {
    const min = Math.min(financingMetrics[metric], consortiumMetrics[metric]);
    financingScore += ratioScore(financingMetrics[metric], min) * weights[metric];
    consortiumScore += ratioScore(consortiumMetrics[metric], min) * weights[metric];
  }

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
