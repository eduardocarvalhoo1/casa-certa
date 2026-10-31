const { round2 } = require('./financingService');
const { CalculationInputError } = require('../utils/errors');

function calculateConsortium({
  creditValue,
  loanTermMonths,
  adminRateTotal,
  reserveFund,
  initialBid = 0,
  propertyValue = creditValue,
  contemplationMonth,
}) {
  if (!(creditValue > 0)) {
    throw new CalculationInputError('O valor do crédito (creditValue) deve ser maior que zero.');
  }
  if (!(propertyValue > 0)) {
    throw new CalculationInputError('O valor do imóvel (propertyValue) deve ser maior que zero.');
  }
  if (creditValue > propertyValue) {
    throw new CalculationInputError('O valor do crédito não pode ser maior que o valor do imóvel.');
  }
  if (!Number.isInteger(loanTermMonths) || loanTermMonths <= 0) {
    throw new CalculationInputError('O prazo deve ser um inteiro maior que zero.');
  }
  if (!(adminRateTotal >= 0 && adminRateTotal <= 1)) {
    throw new CalculationInputError('A taxa de administração total deve estar entre 0 e 1 (0% a 100%).');
  }
  if (!(reserveFund >= 0)) {
    throw new CalculationInputError('O fundo de reserva não pode ser negativo.');
  }
  if (!(initialBid >= 0)) {
    throw new CalculationInputError('O lance inicial não pode ser negativo.');
  }
  if (initialBid >= creditValue) {
    throw new CalculationInputError('O lance inicial deve ser menor que o valor do crédito.');
  }
  if (
    contemplationMonth !== undefined &&
    contemplationMonth !== null &&
    (!Number.isInteger(contemplationMonth) ||
      contemplationMonth < 1 ||
      contemplationMonth > loanTermMonths)
  ) {
    throw new CalculationInputError('O mês de contemplação deve ser um inteiro entre 1 e o prazo do consórcio.');
  }

  const adminFee = creditValue * adminRateTotal;
  const reserveFee = creditValue * reserveFund;
  const totalTaxes = adminFee + reserveFee;

  const totalDebt = creditValue + totalTaxes;
  const monthlyPayment = totalDebt / loanTermMonths;

  const balance = totalDebt - initialBid;

  const fullInstallments = Math.floor(balance / monthlyPayment);
  const remainder = balance - fullInstallments * monthlyPayment;
  let estimatedTermWithBid = Math.max(
    1,
    remainder < 0.005 ? fullInstallments : fullInstallments + 1
  );

  const toCents = (value) => Math.round(value * 100);
  const balanceCents =
    toCents(creditValue) + toCents(totalTaxes) - toCents(initialBid);
  const regularCents = toCents(monthlyPayment);

  let lastCents = balanceCents - (estimatedTermWithBid - 1) * regularCents;
  if (lastCents <= 0 && estimatedTermWithBid > 1) {
    estimatedTermWithBid -= 1;
    lastCents += regularCents;
  }

  const evolution = [];
  let remainingCents = balanceCents;
  for (let month = 1; month <= estimatedTermWithBid; month++) {
    const paymentCents = month === estimatedTermWithBid ? lastCents : regularCents;
    remainingCents -= paymentCents;

    evolution.push({
      month,
      payment: paymentCents / 100,
      balance: remainingCents / 100,
    });
  }

  const ownResources = propertyValue - creditValue;

  const totalPaid = balanceCents / 100 + initialBid + ownResources;

  const requestedContemplation = contemplationMonth ?? Math.ceil(loanTermMonths / 2);
  const effectiveContemplation = Math.min(requestedContemplation, estimatedTermWithBid);

  return {
    monthlyPayment: round2(monthlyPayment),
    ownResources: round2(ownResources),
    totalPaid: round2(totalPaid),
    totalTaxes: round2(totalTaxes),
    estimatedTermWithBid,
    contemplationMonth: effectiveContemplation,
    evolution,
  };
}

module.exports = {
  calculateConsortium,
};
