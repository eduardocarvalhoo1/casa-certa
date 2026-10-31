const OBJECTIVES = {
  COMPRAR_IMOVEL: {
    id: 'COMPRAR_IMOVEL',
    name: 'Comprar Imóvel',
    description: 'Equilíbrio: parcela razoável, prazo moderado, custo controlado',
    weights: {
      totalCost: 0.40,
      payoffTerm: 0.20,
      timeToProperty: 0.15,
      initialPayment: 0.25,
    },
  },
  INVESTIR: {
    id: 'INVESTIR',
    name: 'Investir',
    description: 'Maximizar retorno: foco em menor custo total',
    weights: {
      totalCost: 0.60,
      payoffTerm: 0.10,
      timeToProperty: 0.10,
      initialPayment: 0.20,
    },
  },
  REFINANCIAR: {
    id: 'REFINANCIAR',
    name: 'Refinanciar',
    description: 'Agilidade: ter o imóvel rápido com parcelas suportáveis',
    weights: {
      totalCost: 0.30,
      payoffTerm: 0.10,
      timeToProperty: 0.30,
      initialPayment: 0.30,
    },
  },
};

const METRICS = ['totalCost', 'payoffTerm', 'timeToProperty', 'initialPayment'];

Object.keys(OBJECTIVES).forEach((key) => {
  const weights = OBJECTIVES[key].weights;
  const sum = METRICS.reduce((acc, metric) => acc + weights[metric], 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(`Weights for ${key} do not sum to 100%: ${sum}`);
  }
});

module.exports = OBJECTIVES;
