const { validateSimulationInput } = require('../src/utils/validation');

function validBody(overrides = {}) {
  return {
    name: 'Simulação Teste',
    objective: 'COMPRAR_IMOVEL',
    system: 'SAC',
    propertyValue: 300000,
    financing: { downPayment: 60000, termYears: 30, interestRateAnnual: 0.09 },
    consortium: { creditValue: 240000, termMonths: 180, adminRateAnnual: 0.02, reserveFund: 0.01 },
    ...overrides,
  };
}

describe('validation.validateSimulationInput', () => {
  describe('quando o payload é válido', () => {
    test('deve aprovar e não retornar nenhum erro', () => {
      const { valid, errors } = validateSimulationInput(validBody());
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });
  });

  describe('quando o payload é inválido', () => {
    test('deve rejeitar quando o corpo da requisição está vazio', () => {
      const { valid, errors } = validateSimulationInput(undefined);
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });

    test('deve rejeitar quando o objective não é um valor permitido', () => {
      const { valid, errors } = validateSimulationInput(validBody({ objective: 'XPTO' }));
      expect(valid).toBe(false);
      expect(errors.some((e) => e.includes('objective'))).toBe(true);
    });

    test('deve rejeitar quando o system não é SAC nem PRICE', () => {
      const { valid } = validateSimulationInput(validBody({ system: 'OUTRO' }));
      expect(valid).toBe(false);
    });

    test('deve rejeitar quando a entrada é maior ou igual ao valor do imóvel', () => {
      const body = validBody();
      body.financing.downPayment = 300000;
      const { valid, errors } = validateSimulationInput(body);
      expect(valid).toBe(false);
      expect(errors.some((e) => e.toLowerCase().includes('entrada'))).toBe(true);
    });

    test('deve rejeitar quando o lance inicial do consórcio é negativo', () => {
      const body = validBody();
      body.consortium.initialBid = -100;
      const { valid } = validateSimulationInput(body);
      expect(valid).toBe(false);
    });

    test('deve acumular e retornar múltiplos erros quando vários campos são inválidos', () => {
      const { valid, errors } = validateSimulationInput({ userId: -1, name: '', objective: 'X', system: 'Y', propertyValue: -5 });
      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(2);
    });
  });
});
