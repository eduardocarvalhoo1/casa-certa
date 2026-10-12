const { round2 } = require('./financingService');

function calculateConsortium({
  creditValue,
  loanTermMonths,
  adminRateAnnual,
  reserveFund,
  initialBid = 0,
}) {
  if (!(creditValue > 0)) {
    throw new Error('O valor do crédito (creditValue) deve ser maior que zero.');
  }
  if (!Number.isInteger(loanTermMonths) || loanTermMonths <= 0) {
    throw new Error('O prazo deve ser um inteiro maior que zero.');
  }
  if (!(adminRateAnnual >= 0)) {
    throw new Error('A taxa de administração anual não pode ser negativa.');
  }
  if (!(reserveFund >= 0)) {
    throw new Error('O fundo de reserva não pode ser negativo.');
  }
  if (!(initialBid >= 0)) {
    throw new Error('O lance inicial não pode ser negativo.');
  }
  if (initialBid >= creditValue) {
    throw new Error('O lance inicial deve ser menor que o valor do crédito.');
  }

  const termYears = loanTermMonths / 12;
  const adminFee = creditValue * adminRateAnnual * termYears;
  const reserveFee = creditValue * reserveFund;
  const totalTaxes = adminFee + reserveFee;

  const totalDebt = creditValue + totalTaxes;
  const monthlyPayment = totalDebt / loanTermMonths;

  let balance = totalDebt - initialBid;
  const estimatedTermWithBid = Math.ceil(balance / monthlyPayment);

  const evolution = [];
  for (let month = 1; month <= estimatedTermWithBid; month++) {
    let payment = monthlyPayment;

    if (month === estimatedTermWithBid) {
      payment = balance;
    }

    balance -= payment;
    if (month === estimatedTermWithBid) balance = 0;

    evolution.push({
      month,
      payment: round2(payment),
      balance: round2(balance),
    });
  }

  const totalPaid = evolution.reduce((sum, e) => sum + e.payment, 0) + initialBid;

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPaid: round2(totalPaid),
    totalTaxes: round2(totalTaxes),
    estimatedTermWithBid,
    evolution,
  };
}

module.exports = {
  calculateConsortium,
};
