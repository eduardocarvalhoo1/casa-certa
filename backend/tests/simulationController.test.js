jest.mock('../src/services/simulationService', () => {
  const actual = jest.requireActual('../src/services/simulationService');
  return {
    ...actual,
    createSimulation: jest.fn(),
  };
});

const simulationService = require('../src/services/simulationService');
const { SimulationValidationError } = simulationService;
const { createSimulation } = require('../src/controllers/simulationController');
const { CalculationInputError } = require('../src/utils/errors');
const { calculateFinancing } = require('../src/services/financingService');
const { calculateConsortium } = require('../src/services/consortiumService');
const { calculateRecommendation } = require('../src/services/recommendationService');

function validBody() {
  return {
    name: 'Simulação Teste',
    objective: 'COMPRAR_IMOVEL',
    system: 'SAC',
    propertyValue: 300000,
    financing: { downPayment: 60000, termYears: 30, interestRateAnnual: 0.09 },
    consortium: { creditValue: 240000, termMonths: 180, adminRateTotal: 0.16, reserveFund: 0.01 },
  };
}

function fakeRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

async function call(body = validBody()) {
  const res = fakeRes();
  await createSimulation({ body, user: { id: 1 } }, res);
  return { status: res.status.mock.calls[0][0], body: res.json.mock.calls[0][0] };
}

describe('simulationController.createSimulation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('deve responder 201 quando a simulação é criada', async () => {
    simulationService.createSimulation.mockResolvedValue({ simulation: { id: 1 } });
    const r = await call();
    expect(r.status).toBe(201);
  });

  test('deve responder 400 sem chamar o service quando o corpo é inválido', async () => {
    const r = await call({ ...validBody(), system: 'XPTO' });
    expect(r.status).toBe(400);
    expect(simulationService.createSimulation).not.toHaveBeenCalled();
  });

  test('deve responder 400 com a mensagem nos detalhes quando o cálculo rejeita os dados', async () => {
    simulationService.createSimulation.mockRejectedValue(
      new CalculationInputError('O lance inicial deve ser menor que o valor do crédito.')
    );
    const r = await call();
    expect(r.status).toBe(400);
    expect(r.body).toEqual({
      error: 'Dados inválidos.',
      details: ['O lance inicial deve ser menor que o valor do crédito.'],
    });
  });

  test('deve responder 400 quando o service lança SimulationValidationError', async () => {
    simulationService.createSimulation.mockRejectedValue(
      new SimulationValidationError('Usuário não encontrado.', ['Nenhum usuário com id 1.'])
    );
    const r = await call();
    expect(r.status).toBe(400);
    expect(r.body.error).toBe('Usuário não encontrado.');
  });

  test.each([
    ['TypeError', new TypeError("Cannot read properties of undefined (reading 'length')")],
    ['Error genérico', new Error('falha inesperada')],
  ])('deve responder 500 sem expor a mensagem interna quando ocorre %s', async (_, error) => {
    simulationService.createSimulation.mockRejectedValue(error);
    const r = await call();
    expect(r.status).toBe(500);
    expect(r.body.error).toBe('Erro interno ao criar simulação.');
    expect(JSON.stringify(r.body)).not.toContain(error.message);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('erros de entrada dos services de cálculo', () => {
  test('o financiamento deve lançar CalculationInputError para dados inválidos', () => {
    expect(() =>
      calculateFinancing({
        propertyValue: 300000, downPayment: 300000, loanTermMonths: 360,
        interestRateAnnual: 0.09, system: 'SAC',
      })
    ).toThrow(CalculationInputError);
  });

  test('o consórcio deve lançar CalculationInputError para dados inválidos', () => {
    expect(() =>
      calculateConsortium({
        creditValue: 300000, loanTermMonths: 180, adminRateTotal: 0.16,
        reserveFund: 0.01, initialBid: 300000,
      })
    ).toThrow(CalculationInputError);
  });

  test('a recomendação deve lançar CalculationInputError para objetivo inválido', () => {
    expect(() =>
      calculateRecommendation({
        financingResult: { totalPaid: 1, initialPayment: 1, evolution: [{}] },
        consortiumResult: { totalPaid: 1, monthlyPayment: 1, estimatedTermWithBid: 1, contemplationMonth: 1 },
        objective: 'XPTO',
      })
    ).toThrow(CalculationInputError);
  });

  test('a recomendação não deve tratar resultado ausente como erro de entrada', () => {
    expect(() =>
      calculateRecommendation({ financingResult: null, consortiumResult: {}, objective: 'INVESTIR' })
    ).not.toThrow(CalculationInputError);
  });
});
