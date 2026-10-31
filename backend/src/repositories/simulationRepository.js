const {
  sequelize,
  User,
  Simulation,
  FinancingResult,
  ConsortiumResult,
  Recommendation,
} = require('../models');

function findUserById(userId) {
  return User.findByPk(userId);
}

function findAllByUser(userId) {
  return Simulation.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    include: [{ model: Recommendation, as: 'recommendation' }],
  });
}

function findByIdAndUser(id, userId) {
  return Simulation.findOne({
    where: { id, userId },
    include: [
      { model: FinancingResult, as: 'financingResult' },
      { model: ConsortiumResult, as: 'consortiumResult' },
      { model: Recommendation, as: 'recommendation' },
    ],
  });
}

function deleteByIdAndUser(id, userId) {
  return Simulation.destroy({ where: { id, userId } });
}

async function createWithResults({
  simulation,
  financingInput,
  consortiumInput,
  financingResult,
  consortiumResult,
  recommendation,
}) {
  return sequelize.transaction(async (t) => {
    const created = await Simulation.create(simulation, { transaction: t });

    await FinancingResult.create(
      {
        simulationId: created.id,
        financeAmount: financingResult.financeAmount,
        initialPayment: financingResult.initialPayment,
        finalPayment: financingResult.finalPayment,
        totalPaid: financingResult.totalPaid,
        totalInterest: financingResult.totalInterest,
        downPayment: financingInput.downPayment,
        termYears: financingInput.termYears,
        interestRateAnnual: financingInput.interestRateAnnual,
        evolution: JSON.stringify(financingResult.evolution),
      },
      { transaction: t }
    );

    await ConsortiumResult.create(
      {
        simulationId: created.id,
        monthlyPayment: consortiumResult.monthlyPayment,
        totalPaid: consortiumResult.totalPaid,
        totalTaxes: consortiumResult.totalTaxes,
        estimatedTermWithBid: consortiumResult.estimatedTermWithBid,
        contemplationMonth: consortiumResult.contemplationMonth,
        ownResources: consortiumResult.ownResources,
        creditValue: consortiumInput.creditValue,
        termMonths: consortiumInput.termMonths,
        adminRateTotal: consortiumInput.adminRateTotal,
        reserveFund: consortiumInput.reserveFund,
        initialBid: consortiumInput.initialBid,
        evolution: JSON.stringify(consortiumResult.evolution),
      },
      { transaction: t }
    );

    await Recommendation.create(
      {
        simulationId: created.id,
        recommendedOption: recommendation.recommendedOption,
        financingScore: recommendation.financingScore,
        consortiumScore: recommendation.consortiumScore,
        financingWeights: JSON.stringify(recommendation.financingWeights),
        consortiumWeights: JSON.stringify(recommendation.consortiumWeights),
      },
      { transaction: t }
    );

    return created;
  });
}

module.exports = {
  findUserById,
  findAllByUser,
  findByIdAndUser,
  deleteByIdAndUser,
  createWithResults,
};
