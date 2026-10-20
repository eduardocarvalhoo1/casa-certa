const { calculateFinancing } = require('../src/services/financingService');

const base = {
  propertyValue: 300000,
  downPayment: 60000,
  loanTermMonths: 360,
  interestRateAnnual: 0.09,
};

describe('financingService.calculateFinancing', () => {
  describe('cálculo base', () => {
    test('deve financiar (valor do imóvel - entrada) quando recebe entrada e valor do imóvel', () => {
      const r = calculateFinancing({ ...base, system: 'SAC' });
      expect(r.financeAmount).toBe(240000);
    });

    test('deve gerar uma parcela para cada mês quando recebe o prazo em meses', () => {
      const r = calculateFinancing({ ...base, system: 'PRICE' });
      expect(r.evolution).toHaveLength(360);
    });
  });

  describe('quando o sistema é PRICE', () => {
    const r = calculateFinancing({ ...base, system: 'PRICE' });

    test('deve manter a parcela constante do início ao fim', () => {
      expect(r.evolution[0].payment).toBe(r.evolution[1].payment);
      expect(r.initialPayment).toBe(r.finalPayment);
    });

    test('deve aumentar a amortização a cada mês que passa', () => {
      expect(r.evolution[1].amortization).toBeGreaterThan(r.evolution[0].amortization);
    });

    test('deve zerar o saldo devedor na última parcela', () => {
      expect(r.evolution[r.evolution.length - 1].balance).toBe(0);
    });
  });

  describe('quando o sistema é SAC', () => {
    const r = calculateFinancing({ ...base, system: 'SAC' });

    test('deve manter a amortização constante em todas as parcelas', () => {
      expect(r.evolution[0].amortization).toBe(r.evolution[1].amortization);
    });

    test('deve reduzir o valor da parcela ao longo do tempo', () => {
      expect(r.initialPayment).toBeGreaterThan(r.finalPayment);
      expect(r.evolution[0].payment).toBeGreaterThan(r.evolution[1].payment);
    });

    test('deve zerar o saldo devedor na última parcela', () => {
      expect(r.evolution[r.evolution.length - 1].balance).toBe(0);
    });
  });

  describe('comparação entre sistemas', () => {
    test('deve pagar menos juros no total no SAC do que no PRICE quando os demais dados são iguais', () => {
      const sac = calculateFinancing({ ...base, system: 'SAC' });
      const price = calculateFinancing({ ...base, system: 'PRICE' });
      expect(sac.totalInterest).toBeLessThan(price.totalInterest);
    });
  });

  describe('validações de entrada', () => {
    test('deve lançar erro quando a taxa de juros é zero', () => {
      expect(() => calculateFinancing({ ...base, interestRateAnnual: 0, system: 'SAC' }))
        .toThrow(/taxa de juros/i);
    });

    test('deve lançar erro quando a entrada é maior ou igual ao valor do imóvel', () => {
      expect(() => calculateFinancing({ ...base, downPayment: 300000, system: 'SAC' }))
        .toThrow(/entrada/i);
    });

    test('deve lançar erro quando o prazo é inválido', () => {
      expect(() => calculateFinancing({ ...base, loanTermMonths: 0, system: 'SAC' }))
        .toThrow(/prazo/i);
    });

    test('deve lançar erro quando o sistema de amortização é inválido', () => {
      expect(() => calculateFinancing({ ...base, system: 'XPTO' }))
        .toThrow(/sistema/i);
    });
  });
});
