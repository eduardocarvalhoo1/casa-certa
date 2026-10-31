jest.mock('../src/repositories/simulationRepository', () => ({
  findUserById: jest.fn(),
  createWithResults: jest.fn(),
  findByIdAndUser: jest.fn(),
}));

const simulationRepository = require('../src/repositories/simulationRepository');
const { createSimulation, getSimulation } = require('../src/services/simulationService');

function input(overrides = {}) {
  return {
    userId: 1,
    name: 'Simulação Teste',
    objective: 'COMPRAR_IMOVEL',
    system: 'SAC',
    propertyValue: 400000,
    financing: { downPayment: 80000, termYears: 30, interestRateAnnual: 0.105 },
    consortium: {
      creditValue: 400000,
      termMonths: 180,
      adminRateTotal: 0.16,
      reserveFund: 0.02,
      ...overrides.consortium,
    },
  };
}

const dec = (v) => (v === null || v === undefined ? null : String(v));

function rowFromSaved(saved, overrides = {}) {
  const { simulation, financingInput, consortiumInput, financingResult, consortiumResult, recommendation } = saved;
  return {
    id: 10,
    ...simulation,
    propertyValue: dec(simulation.propertyValue),
    createdAt: new Date('2026-10-29T12:00:00Z'),
    financingResult: {
      financeAmount: dec(financingResult.financeAmount),
      initialPayment: dec(financingResult.initialPayment),
      finalPayment: dec(financingResult.finalPayment),
      totalPaid: dec(financingResult.totalPaid),
      totalInterest: dec(financingResult.totalInterest),
      downPayment: dec(financingInput.downPayment),
      termYears: financingInput.termYears,
      interestRateAnnual: dec(financingInput.interestRateAnnual),
      evolution: JSON.stringify(financingResult.evolution),
      ...overrides.financingResult,
    },
    consortiumResult: {
      monthlyPayment: dec(consortiumResult.monthlyPayment),
      ownResources: dec(consortiumResult.ownResources),
      totalPaid: dec(consortiumResult.totalPaid),
      totalTaxes: dec(consortiumResult.totalTaxes),
      estimatedTermWithBid: consortiumResult.estimatedTermWithBid,
      contemplationMonth: consortiumResult.contemplationMonth,
      creditValue: dec(consortiumInput.creditValue),
      termMonths: consortiumInput.termMonths,
      adminRateTotal: dec(consortiumInput.adminRateTotal),
      reserveFund: dec(consortiumInput.reserveFund),
      initialBid: dec(consortiumInput.initialBid),
      evolution: JSON.stringify(consortiumResult.evolution),
      ...overrides.consortiumResult,
    },
    recommendation: {
      recommendedOption: recommendation.recommendedOption,
      financingScore: dec(recommendation.financingScore),
      consortiumScore: dec(recommendation.consortiumScore),
      financingWeights: JSON.stringify(recommendation.financingWeights),
      consortiumWeights: JSON.stringify(recommendation.consortiumWeights),
    },
  };
}

function lastSaved() {
  const calls = simulationRepository.createWithResults.mock.calls;
  return calls[calls.length - 1][0];
}

describe('simulationService.createSimulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulationRepository.findUserById.mockResolvedValue({ id: 1 });
    simulationRepository.createWithResults.mockImplementation(({ simulation }) =>
      Promise.resolve({ id: 10, ...simulation, createdAt: new Date() })
    );
  });

  describe('quando o crédito do consórcio é igual ao valor do imóvel', () => {
    test('não deve haver complemento e a coluna "Entrada / Lance" deve ser só o lance', async () => {
      const r = await createSimulation(input({ consortium: { initialBid: 30000 } }));
      expect(r.consortiumResult.ownResources).toBe(0);
      expect(r.comparison.downPaymentOrBid.consortium).toBe(30000);
    });
  });

  describe('quando o crédito do consórcio é menor que o valor do imóvel', () => {
    test('deve repassar o valor do imóvel ao consórcio e somar o complemento ao custo total', async () => {
      const r = await createSimulation(input({ consortium: { creditValue: 300000 } }));
      const parcelas = r.consortiumResult.evolution.reduce((sum, e) => sum + e.payment, 0);

      expect(r.consortiumResult.ownResources).toBe(100000);
      expect(r.consortiumResult.totalPaid).toBeCloseTo(parcelas + 100000, 2);
      expect(r.comparison.totalCost.consortium).toBe(r.consortiumResult.totalPaid);
    });

    test('deve mostrar lance + complemento na coluna "Entrada / Lance"', async () => {
      const r = await createSimulation(
        input({ consortium: { creditValue: 300000, initialBid: 30000 } })
      );
      expect(r.comparison.downPaymentOrBid.consortium).toBe(130000);
    });
  });

  describe('tempo até ter o imóvel', () => {
    test('deve usar metade do prazo e mostrar 0 meses no financiamento quando o mês não é informado', async () => {
      const r = await createSimulation(input());
      expect(r.consortiumResult.contemplationMonth).toBe(90);
      expect(r.comparison.timeToProperty).toEqual({ financing: 0, consortium: 90 });
    });

    test('deve repassar o mês informado ao cálculo, à comparação e ao repositório', async () => {
      const r = await createSimulation(input({ consortium: { contemplationMonth: 24 } }));
      expect(r.comparison.timeToProperty.consortium).toBe(24);
      expect(lastSaved().consortiumResult.contemplationMonth).toBe(24);
    });

    test('deve aumentar o score do consórcio quando a contemplação é mais cedo', async () => {
      const cedo = await createSimulation(input({ consortium: { contemplationMonth: 1 } }));
      const tarde = await createSimulation(input({ consortium: { contemplationMonth: 180 } }));
      expect(cedo.recommendation.consortiumScore).toBeGreaterThan(tarde.recommendation.consortiumScore);
      expect(cedo.recommendation.financingScore).toBe(tarde.recommendation.financingScore);
    });
  });

  describe('persistência das entradas', () => {
    test('deve enviar as entradas do financiamento e do consórcio ao repositório', async () => {
      await createSimulation(input({ consortium: { creditValue: 300000, initialBid: 30000 } }));
      const saved = lastSaved();

      expect(saved.financingInput).toEqual({
        downPayment: 80000,
        termYears: 30,
        interestRateAnnual: 0.105,
      });
      expect(saved.consortiumInput).toEqual({
        creditValue: 300000,
        termMonths: 180,
        adminRateTotal: 0.16,
        reserveFund: 0.02,
        initialBid: 30000,
      });
      expect(saved.consortiumResult.ownResources).toBe(100000);
    });

    test('deve salvar o lance como 0 quando ele não é informado', async () => {
      await createSimulation(input());
      expect(lastSaved().consortiumInput.initialBid).toBe(0);
    });

    test('deve devolver as entradas no bloco "input" da resposta', async () => {
      const r = await createSimulation(input());
      expect(r.input.financing.downPayment).toBe(80000);
      expect(r.input.consortium.initialBid).toBe(0);
    });
  });
});

describe('simulationService.getSimulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    simulationRepository.findUserById.mockResolvedValue({ id: 1 });
    simulationRepository.createWithResults.mockImplementation(({ simulation }) =>
      Promise.resolve({ id: 10, ...simulation, createdAt: new Date('2026-10-29T12:00:00Z') })
    );
  });

  test('deve devolver a mesma comparison, entradas e complemento retornados na criação', async () => {
    const created = await createSimulation(
      input({ consortium: { creditValue: 300000, initialBid: 30000 } })
    );
    simulationRepository.findByIdAndUser.mockResolvedValue(rowFromSaved(lastSaved()));

    const fetched = await getSimulation(10, 1);

    expect(fetched.comparison).toEqual(created.comparison);
    expect(fetched.input).toEqual(created.input);
    expect(fetched.consortiumResult.ownResources).toBe(100000);
  });

  test('deve converter os DECIMAL do banco (string) para número', async () => {
    await createSimulation(input());
    simulationRepository.findByIdAndUser.mockResolvedValue(rowFromSaved(lastSaved()));

    const fetched = await getSimulation(10, 1);

    expect(typeof fetched.input.financing.interestRateAnnual).toBe('number');
    expect(typeof fetched.input.consortium.adminRateTotal).toBe('number');
    expect(typeof fetched.comparison.downPaymentOrBid.financing).toBe('number');
  });

  describe('quando a simulação é antiga (salva sem as entradas)', () => {
    async function fetchLegacy() {
      await createSimulation(input());
      const legacy = rowFromSaved(lastSaved(), {
        financingResult: { downPayment: null, termYears: null, interestRateAnnual: null },
        consortiumResult: {
          contemplationMonth: null,
          ownResources: null,
          creditValue: null,
          termMonths: null,
          adminRateTotal: null,
          reserveFund: null,
          initialBid: null,
        },
      });
      simulationRepository.findByIdAndUser.mockResolvedValue(legacy);
      return getSimulation(10, 1);
    }

    test('deve devolver as entradas e o complemento como null', async () => {
      const fetched = await fetchLegacy();
      expect(fetched.input.financing).toEqual({
        downPayment: null,
        termYears: null,
        interestRateAnnual: null,
      });
      expect(fetched.input.consortium.initialBid).toBeNull();
      expect(fetched.consortiumResult.ownResources).toBeNull();
    });

    test('deve devolver "Entrada / Lance" como null sem quebrar os demais indicadores', async () => {
      const fetched = await fetchLegacy();
      expect(fetched.comparison.downPaymentOrBid).toEqual({ financing: null, consortium: null });
      expect(fetched.comparison.timeToProperty).toEqual({ financing: 0, consortium: null });
      expect(fetched.comparison.totalCost.financing).toBe(fetched.financingResult.totalPaid);
      expect(fetched.comparison.timeframe.financing).toBe(360);
    });
  });

  test('deve lançar SimulationNotFoundError quando a simulação não existe', async () => {
    simulationRepository.findByIdAndUser.mockResolvedValue(null);
    await expect(getSimulation(99, 1)).rejects.toThrow('Simulação não encontrada.');
  });
});
