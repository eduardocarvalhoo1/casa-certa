const {
  sequelize,
  User,
  Simulation,
  FinancingResult,
  ConsortiumResult,
  Recommendation,
} = require('../models');
const { calculateFinancing } = require('../services/financingService');
const { calculateConsortium } = require('../services/consortiumService');
const { calculateRecommendation } = require('../services/recommendationService');
const { validateSimulationInput } = require('../utils/validation');
const response = require('../utils/response');

async function createSimulation(req, res) {
  const { valid, errors } = validateSimulationInput(req.body);
  if (!valid) {
    return response.badRequest(res, 'Dados inválidos.', errors);
  }

  const { userId, name, objective, system, propertyValue, financing, consortium } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return response.badRequest(res, 'Usuário não encontrado.', [
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
      adminRateAnnual: consortium.adminRateAnnual,
      reserveFund: consortium.reserveFund,
      initialBid: consortium.initialBid,
    });

    const recommendation = calculateRecommendation({
      financingResult,
      consortiumResult,
      objective,
    });

    const result = await sequelize.transaction(async (t) => {
      const simulation = await Simulation.create(
        { name, objective, system, propertyValue, userId },
        { transaction: t }
      );

      await FinancingResult.create(
        {
          simulationId: simulation.id,
          financeAmount: financingResult.financeAmount,
          initialPayment: financingResult.initialPayment,
          finalPayment: financingResult.finalPayment,
          totalPaid: financingResult.totalPaid,
          totalInterest: financingResult.totalInterest,
          evolution: JSON.stringify(financingResult.evolution),
        },
        { transaction: t }
      );

      await ConsortiumResult.create(
        {
          simulationId: simulation.id,
          monthlyPayment: consortiumResult.monthlyPayment,
          totalPaid: consortiumResult.totalPaid,
          totalTaxes: consortiumResult.totalTaxes,
          estimatedTermWithBid: consortiumResult.estimatedTermWithBid,
          evolution: JSON.stringify(consortiumResult.evolution),
        },
        { transaction: t }
      );

      await Recommendation.create(
        {
          simulationId: simulation.id,
          recommendedOption: recommendation.recommendedOption,
          financingScore: recommendation.financingScore,
          consortiumScore: recommendation.consortiumScore,
          financingWeights: JSON.stringify(recommendation.financingWeights),
          consortiumWeights: JSON.stringify(recommendation.consortiumWeights),
        },
        { transaction: t }
      );

      return simulation;
    });

    const comparison = {
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
      downPaymentOrBid: {
        financing: financing.downPayment,
        consortium: consortium.initialBid || 0,
      },
    };

    return response.success(res, 201, {
      simulation: {
        id: result.id,
        name: result.name,
        objective: result.objective,
        system: result.system,
        propertyValue: Number(result.propertyValue),
        userId: result.userId,
        createdAt: result.createdAt,
      },
      financingResult,
      consortiumResult,
      recommendation,
      comparison,
    });
  } catch (err) {
    if (err instanceof Error && err.message && !err.name.includes('Sequelize')) {
      return response.badRequest(res, err.message);
    }
    console.error('Erro ao criar simulação:', err);
    return response.serverError(res, 'Erro interno ao criar simulação.');
  }
}

module.exports = { createSimulation };
