const { calculateRecommendation } = require('../src/services/recommendationService');

function makeFinancing({ totalPaid, months, initialPayment }) {
  return {
    totalPaid,
    initialPayment,
    evolution: new Array(months).fill({}),
  };
}

function makeConsortium({ totalPaid, term, monthlyPayment }) {
  return {
    totalPaid,
    estimatedTermWithBid: term,
    monthlyPayment,
  };
}

describe('recommendationService.calculateRecommendation', () => {
  describe('escolha da opção recomendada', () => {
    test('deve recomendar FINANCING quando ele vence o consórcio em todas as métricas', () => {
      const financingResult = makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 });
      const consortiumResult = makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000 });
      const r = calculateRecommendation({ financingResult, consortiumResult, objective: 'COMPRAR_IMOVEL' });
      expect(r.recommendedOption).toBe('FINANCING');
      expect(r.financingScore).toBeGreaterThan(r.consortiumScore);
    });

    test('deve recomendar CONSORTIUM quando ele vence o financiamento em todas as métricas', () => {
      const financingResult = makeFinancing({ totalPaid: 600000, months: 360, initialPayment: 4000 });
      const consortiumResult = makeConsortium({ totalPaid: 300000, term: 150, monthlyPayment: 2000 });
      const r = calculateRecommendation({ financingResult, consortiumResult, objective: 'INVESTIR' });
      expect(r.recommendedOption).toBe('CONSORTIUM');
      expect(r.consortiumScore).toBeGreaterThan(r.financingScore);
    });
  });

  describe('cálculo do score', () => {
    test('deve atribuir score 100 à opção que é melhor em todas as métricas', () => {
      const financingResult = makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 });
      const consortiumResult = makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000 });
      const r = calculateRecommendation({ financingResult, consortiumResult, objective: 'COMPRAR_IMOVEL' });
      expect(r.financingScore).toBe(100);
    });

    test('deve aplicar pesos diferentes quando o objetivo muda', () => {
      const financingResult = makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 });
      const consortiumResult = makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000 });
      const investir = calculateRecommendation({ financingResult, consortiumResult, objective: 'INVESTIR' });
      const refinanciar = calculateRecommendation({ financingResult, consortiumResult, objective: 'REFINANCIAR' });
      expect(investir.financingWeights).not.toEqual(refinanciar.financingWeights);
    });
  });

  describe('validações de entrada', () => {
    test('deve lançar erro quando o objetivo é inválido', () => {
      const financingResult = makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 });
      const consortiumResult = makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000 });
      expect(() => calculateRecommendation({ financingResult, consortiumResult, objective: 'XPTO' }))
        .toThrow(/objetivo/i);
    });
  });
});
