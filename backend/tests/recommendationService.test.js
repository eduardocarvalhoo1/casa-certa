const { calculateRecommendation } = require('../src/services/recommendationService');
const OBJECTIVES = require('../src/config/objectives');

function makeFinancing({ totalPaid, months, initialPayment }) {
  return {
    totalPaid,
    initialPayment,
    evolution: new Array(months).fill({}),
  };
}

function makeConsortium({ totalPaid, term, monthlyPayment, contemplationMonth = Math.ceil(term / 2) }) {
  return {
    totalPaid,
    estimatedTermWithBid: term,
    monthlyPayment,
    contemplationMonth,
  };
}

const financingWins = () => ({
  financingResult: makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 }),
  consortiumResult: makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000 }),
});

describe('recommendationService.calculateRecommendation', () => {
  describe('pesos por objetivo', () => {
    test.each(Object.keys(OBJECTIVES))('%s deve ter as 4 métricas somando 100%%', (key) => {
      const w = OBJECTIVES[key].weights;
      expect(Object.keys(w).sort()).toEqual(
        ['initialPayment', 'payoffTerm', 'timeToProperty', 'totalCost']
      );
      expect(w.totalCost + w.payoffTerm + w.timeToProperty + w.initialPayment).toBeCloseTo(1, 6);
    });

    test('REFINANCIAR deve dar mais peso ao tempo até ter o imóvel que os demais objetivos', () => {
      const t = (key) => OBJECTIVES[key].weights.timeToProperty;
      expect(t('REFINANCIAR')).toBeGreaterThan(t('COMPRAR_IMOVEL'));
      expect(t('REFINANCIAR')).toBeGreaterThan(t('INVESTIR'));
    });
  });

  describe('escolha da opção recomendada', () => {
    test('deve recomendar FINANCING quando ele vence o consórcio em todas as métricas', () => {
      const r = calculateRecommendation({ ...financingWins(), objective: 'COMPRAR_IMOVEL' });
      expect(r.recommendedOption).toBe('FINANCING');
      expect(r.financingScore).toBeGreaterThan(r.consortiumScore);
    });

    test('deve recomendar CONSORTIUM quando ele vence custo, quitação e parcela', () => {
      const financingResult = makeFinancing({ totalPaid: 600000, months: 360, initialPayment: 4000 });
      const consortiumResult = makeConsortium({ totalPaid: 300000, term: 150, monthlyPayment: 2000 });
      const r = calculateRecommendation({ financingResult, consortiumResult, objective: 'INVESTIR' });
      expect(r.recommendedOption).toBe('CONSORTIUM');
      expect(r.consortiumScore).toBeGreaterThan(r.financingScore);
    });

    test('deve trocar a recomendação para FINANCING no REFINANCIAR pelo peso do tempo até o imóvel', () => {
      const financingResult = makeFinancing({ totalPaid: 520000, months: 240, initialPayment: 2600 });
      const consortiumResult = makeConsortium({
        totalPaid: 480000, term: 200, monthlyPayment: 2400, contemplationMonth: 100,
      });
      const investir = calculateRecommendation({ financingResult, consortiumResult, objective: 'INVESTIR' });
      const refinanciar = calculateRecommendation({ financingResult, consortiumResult, objective: 'REFINANCIAR' });
      expect(investir.recommendedOption).toBe('CONSORTIUM');
      expect(refinanciar.recommendedOption).toBe('FINANCING');
    });
  });

  describe('cálculo do score', () => {
    test('deve atribuir score 100 à opção que é melhor em todas as métricas', () => {
      const r = calculateRecommendation({ ...financingWins(), objective: 'COMPRAR_IMOVEL' });
      expect(r.financingScore).toBe(100);
    });

    test('deve aplicar pesos diferentes quando o objetivo muda', () => {
      const investir = calculateRecommendation({ ...financingWins(), objective: 'INVESTIR' });
      const refinanciar = calculateRecommendation({ ...financingWins(), objective: 'REFINANCIAR' });
      expect(investir.financingWeights).not.toEqual(refinanciar.financingWeights);
    });
  });

  describe('tempo até ter o imóvel', () => {
    const financingResult = makeFinancing({ totalPaid: 400000, months: 120, initialPayment: 2000 });
    const consortiumAt = (contemplationMonth) =>
      makeConsortium({ totalPaid: 500000, term: 180, monthlyPayment: 3000, contemplationMonth });
    const score = (contemplationMonth, objective = 'REFINANCIAR') =>
      calculateRecommendation({
        financingResult,
        consortiumResult: consortiumAt(contemplationMonth),
        objective,
      });

    test('deve dar mais pontos ao consórcio quanto mais cedo for a contemplação', () => {
      expect(score(30).consortiumScore).toBeGreaterThan(score(90).consortiumScore);
      expect(score(90).consortiumScore).toBeGreaterThan(score(180).consortiumScore);
    });

    test('não deve alterar o score do financiamento, que sempre tem o imóvel no mês 0', () => {
      expect(score(30).financingScore).toBe(score(180).financingScore);
    });

    test('deve valer 0 para o consórcio quando a contemplação é no último mês', () => {
      const w = OBJECTIVES.REFINANCIAR.weights.timeToProperty;
      expect(score(1).consortiumScore - score(180).consortiumScore).toBeCloseTo(
        100 * (1 - 1 / 180) * w,
        1
      );
    });

    test('deve valer 50 para o consórcio quando a contemplação é na metade do prazo', () => {
      const w = OBJECTIVES.REFINANCIAR.weights.timeToProperty;
      expect(score(90).consortiumScore - score(180).consortiumScore).toBeCloseTo(50 * w, 1);
    });
  });

  describe('validações de entrada', () => {
    test('deve lançar erro quando o objetivo é inválido', () => {
      expect(() => calculateRecommendation({ ...financingWins(), objective: 'XPTO' }))
        .toThrow(/objetivo/i);
    });

    test('deve lançar erro quando o consórcio não tem mês de contemplação', () => {
      const { financingResult, consortiumResult } = financingWins();
      delete consortiumResult.contemplationMonth;
      expect(() =>
        calculateRecommendation({ financingResult, consortiumResult, objective: 'INVESTIR' })
      ).toThrow(/contemplação/i);
    });
  });
});
