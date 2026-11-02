export function buildComparison(result) {
  if (!result) return null;
  if (result.comparison) return result.comparison;

  const financing = result.financingResult;
  const consortium = result.consortiumResult;
  if (!financing || !consortium) return null;

  return {
    initialPayment: {
      financing: financing.initialPayment,
      consortium: consortium.monthlyPayment,
    },
    totalCost: {
      financing: financing.totalPaid,
      consortium: consortium.totalPaid,
    },
    interestOrTaxes: {
      financing: financing.totalInterest,
      consortium: consortium.totalTaxes,
    },
    timeframe: {
      financing: Array.isArray(financing.evolution)
        ? financing.evolution.length
        : null,
      consortium: consortium.estimatedTermWithBid,
    },
    timeToProperty: {
      financing: 0,
      consortium: consortium.contemplationMonth ?? null,
    },
    downPaymentOrBid: {
      financing: null,
      consortium: null,
    },
  };
}

export function estimatedSavings(comparison) {
  if (!comparison?.totalCost) return null;
  const { financing, consortium } = comparison.totalCost;
  if (!Number.isFinite(financing) || !Number.isFinite(consortium)) return null;
  return Math.abs(financing - consortium);
}
