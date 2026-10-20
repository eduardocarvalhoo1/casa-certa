const { calculateConsortium } = require('../src/services/consortiumService');

const base = {
  creditValue: 300000,
  loanTermMonths: 180,
  adminRateAnnual: 0.02,
  reserveFund: 0.01,
};

describe('consortiumService.calculateConsortium', () => {
  describe('cálculo de taxas e parcelas', () => {
    test('deve somar taxa de administração e fundo de reserva quando calcula o total de taxas', () => {
      const r = calculateConsortium({ ...base });
      // administração: 300000 * 0.02 * 15 = 90000 ; fundo de reserva: 300000 * 0.01 = 3000
      expect(r.totalTaxes).toBe(93000);
    });

    test('deve dividir (crédito + taxas) pelo prazo quando calcula a parcela mensal', () => {
      const r = calculateConsortium({ ...base });
      // (300000 + 93000) / 180
      expect(r.monthlyPayment).toBe(2183.33);
    });
  });

  describe('quando não há lance', () => {
    const r = calculateConsortium({ ...base });

    test('deve manter o prazo estimado igual ao prazo contratado', () => {
      expect(r.estimatedTermWithBid).toBe(180);
    });

    test('deve gerar a evolução até o prazo contratado', () => {
      expect(r.evolution).toHaveLength(180);
    });
  });

  describe('quando há lance', () => {
    const semLance = calculateConsortium({ ...base });
    const comLance = calculateConsortium({ ...base, initialBid: 50000 });

    test('deve encurtar o prazo estimado em relação a quando não há lance', () => {
      expect(comLance.estimatedTermWithBid).toBeLessThan(semLance.estimatedTermWithBid);
    });

    test('deve manter a parcela mensal igual a quando não há lance', () => {
      expect(comLance.monthlyPayment).toBe(semLance.monthlyPayment);
    });

    test('deve terminar a evolução no prazo reduzido', () => {
      expect(comLance.evolution).toHaveLength(comLance.estimatedTermWithBid);
    });

    test('deve zerar o saldo devedor na última parcela', () => {
      const r = calculateConsortium({ ...base, initialBid: 50000 });
      expect(r.evolution[r.evolution.length - 1].balance).toBe(0);
    });
  });

  describe('cenário completo (crédito 500k, lance 100k, prazo 180 meses)', () => {
    const r = calculateConsortium({
      creditValue: 500000,
      loanTermMonths: 180,
      adminRateAnnual: 0.02,
      reserveFund: 0.01,
      initialBid: 100000,
    });

    test('deve calcular a parcela mensal de 3638.89', () => {
      expect(r.monthlyPayment).toBe(3638.89);
    });

    test('deve reduzir o prazo estimado para 153 meses', () => {
      expect(r.estimatedTermWithBid).toBe(153);
    });

    test('deve gerar a evolução com 153 parcelas', () => {
      expect(r.evolution).toHaveLength(153);
    });

    test('deve calcular o total de taxas em 155000', () => {
      expect(r.totalTaxes).toBe(155000);
    });
  });

  describe('validações de entrada', () => {
    test('deve lançar erro quando o valor de crédito é inválido', () => {
      expect(() => calculateConsortium({ ...base, creditValue: 0 })).toThrow(/crédito/i);
    });

    test('deve lançar erro quando o lance é maior ou igual ao crédito', () => {
      expect(() => calculateConsortium({ ...base, initialBid: 300000 })).toThrow(/lance/i);
    });
  });
});
