function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function annualToMonthlyRate(annualRate) {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

function calculateFinancing({
  propertyValue,
  downPayment,
  loanTermMonths,
  interestRateAnnual,
  system,
}) {
  if (!(propertyValue > 0)) {
    throw new Error('O valor do imóvel (propertyValue) deve ser maior que zero.');
  }
  if (!(downPayment >= 0)) {
    throw new Error('A entrada (downPayment) não pode ser negativa.');
  }
  if (downPayment >= propertyValue) {
    throw new Error('A entrada (downPayment) deve ser menor que o valor do imóvel.');
  }
  if (!Number.isInteger(loanTermMonths) || loanTermMonths <= 0) {
    throw new Error('O prazo (loanTermMonths) deve ser um inteiro maior que zero.');
  }
  if (!(interestRateAnnual > 0)) {
    throw new Error('A taxa de juros anual (interestRateAnnual) deve ser maior que zero.');
  }

  const normalizedSystem = String(system).toUpperCase();
  if (normalizedSystem !== 'SAC' && normalizedSystem !== 'PRICE') {
    throw new Error('O sistema (system) deve ser "SAC" ou "PRICE".');
  }

  const financeAmount = propertyValue - downPayment;
  const i = annualToMonthlyRate(interestRateAnnual);
  const n = loanTermMonths;

  const evolution = [];
  let balance = financeAmount;
  let totalInterest = 0;
  let totalPaid = 0;

  if (normalizedSystem === 'PRICE') {
    const payment = (financeAmount * i) / (1 - Math.pow(1 + i, -n));

    for (let month = 1; month <= n; month++) {
      const interest = balance * i;
      let amortization = payment - interest;
      let currentPayment = payment;

      if (month === n) {
        amortization = balance;
        currentPayment = balance + interest;
      }

      balance -= amortization;
      if (month === n) balance = 0;

      totalInterest += interest;
      totalPaid += currentPayment;

      evolution.push({
        month,
        payment: round2(currentPayment),
        interest: round2(interest),
        amortization: round2(amortization),
        balance: round2(balance),
      });
    }
  } else {
    const amortization = financeAmount / n;

    for (let month = 1; month <= n; month++) {
      const interest = balance * i;
      let currentAmortization = amortization;
      let currentPayment = amortization + interest;

      if (month === n) {
        currentAmortization = balance;
        currentPayment = balance + interest;
      }

      balance -= currentAmortization;
      if (month === n) balance = 0;

      totalInterest += interest;
      totalPaid += currentPayment;

      evolution.push({
        month,
        payment: round2(currentPayment),
        interest: round2(interest),
        amortization: round2(currentAmortization),
        balance: round2(balance),
      });
    }
  }

  return {
    financeAmount: round2(financeAmount),
    initialPayment: evolution[0].payment,
    finalPayment: evolution[evolution.length - 1].payment,
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    evolution,
  };
}

module.exports = {
  calculateFinancing,
  annualToMonthlyRate,
  round2,
};
