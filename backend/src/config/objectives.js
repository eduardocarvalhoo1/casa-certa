const OBJECTIVES = {
  COMPRAR_IMOVEL: {
    id: 'COMPRAR_IMOVEL',
    name: 'Comprar Imóvel',
    description: 'Equilíbrio: quer entrada razoável, prazo moderado, custo controlado',
    weights: {
      totalCost: 0.40,      // Custo total: 40%
      timeframe: 0.35,      // Prazo: 35%
      initialPayment: 0.25  // Parcela inicial: 25%
    }
  },
  INVESTIR: {
    id: 'INVESTIR',
    name: 'Investir',
    description: 'Maximizar retorno: foco em menor custo total',
    weights: {
      totalCost: 0.60,      // Custo total: 60%
      timeframe: 0.20,      // Prazo: 20%
      initialPayment: 0.20  // Parcela inicial: 20%
    }
  },
  REFINANCIAR: {
    id: 'REFINANCIAR',
    name: 'Refinanciar',
    description: 'Agilidade: sair da situação atual rápido com parcelas suportáveis',
    weights: {
      totalCost: 0.30,      // Custo total: 30%
      timeframe: 0.40,      // Prazo: 40%
      initialPayment: 0.30  // Parcela inicial: 30%
    }
  }
};

Object.keys(OBJECTIVES).forEach(key => {
  const weights = OBJECTIVES[key].weights;
  const sum = weights.totalCost + weights.timeframe + weights.initialPayment;
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(`Weights for ${key} do not sum to 100%: ${sum}`);
  }
});

module.exports = OBJECTIVES;
