const { calculateConsortium } = require('../src/services/consortiumService');

const base = {
  creditValue: 300000,
  loanTermMonths: 180,
  adminRateTotal: 0.30,
  reserveFund: 0.01,
};

describe('consortiumService.calculateConsortium', () => {
  describe('cálculo de taxas e parcelas', () => {
    test('deve somar taxa de administração e fundo de reserva quando calcula o total de taxas', () => {
      const r = calculateConsortium({ ...base });
      expect(r.totalTaxes).toBe(93000);
    });

    test('não deve alterar a taxa de administração quando o prazo muda', () => {
      const curto = calculateConsortium({ ...base, loanTermMonths: 60 });
      const longo = calculateConsortium({ ...base, loanTermMonths: 240 });
      expect(curto.totalTaxes).toBe(93000);
      expect(longo.totalTaxes).toBe(93000);
    });

    test('deve cobrar só o fundo de reserva quando a taxa de administração é zero', () => {
      const r = calculateConsortium({ ...base, adminRateTotal: 0 });
      expect(r.totalTaxes).toBe(3000);
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

  describe('arredondamento do prazo (sem mês extra com parcela R$ 0,00)', () => {
    test.each([
      [100000, 180, 0.1],
      [123456.78, 60, 0],
      [123456.78, 100, 0.1],
    ])(
      'deve manter o prazo contratado sem lance (crédito %p, %p meses, adm. %p)',
      (creditValue, loanTermMonths, adminRateTotal) => {
        const r = calculateConsortium({ creditValue, loanTermMonths, adminRateTotal, reserveFund: 0.02 });
        expect(r.estimatedTermWithBid).toBe(loanTermMonths);
        expect(r.evolution.at(-1).payment).toBeGreaterThan(0);
      }
    );

    test('deve reduzir exatamente 1 mês quando o lance é igual a uma parcela', () => {
      const semLance = calculateConsortium({ ...base });
      const r = calculateConsortium({ ...base, initialBid: (300000 + 93000) / 180 });
      expect(semLance.estimatedTermWithBid).toBe(180);
      expect(r.estimatedTermWithBid).toBe(179);
      expect(r.evolution.at(-1).payment).toBe(2183.93);
    });

    test('deve manter o prazo e diminuir só a última parcela quando o lance é menor que uma parcela', () => {
      const r = calculateConsortium({ ...base, initialBid: 1000 });
      expect(r.estimatedTermWithBid).toBe(180);
      expect(r.evolution.at(-1).payment).toBe(1183.93);
    });

    test('não deve gerar parcela R$ 0,00 em nenhuma combinação de crédito, prazo, taxa e lance', () => {
      const credits = [100000, 123456.78, 250000, 333333, 777777.77];
      const terms = [60, 100, 120, 180, 240];
      const rates = [0, 0.1, 0.13, 0.16, 0.3];
      for (const creditValue of credits) {
        for (const loanTermMonths of terms) {
          for (const adminRateTotal of rates) {
            for (const installmentsBid of [0, 1, 5]) {
              const parcela = (creditValue * (1 + adminRateTotal + 0.02)) / loanTermMonths;
              const r = calculateConsortium({
                creditValue,
                loanTermMonths,
                adminRateTotal,
                reserveFund: 0.02,
                initialBid: installmentsBid * parcela,
              });
              expect(r.estimatedTermWithBid).toBe(loanTermMonths - installmentsBid);
              expect(r.evolution.every((e) => e.payment > 0)).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('arredondamento das parcelas em centavos', () => {
    const toCents = (v) => Math.round(v * 100);
    const sumCents = (r) => r.evolution.reduce((sum, e) => sum + toCents(e.payment), 0);

    test('deve ajustar a última parcela para cima quando o arredondamento fica abaixo da dívida', () => {
      const r = calculateConsortium({
        creditValue: 400000, loanTermMonths: 180, adminRateTotal: 0.16, reserveFund: 0.02,
      });
      expect(r.monthlyPayment).toBe(2622.22);
      expect(r.evolution.at(-1).payment).toBe(2622.62);
      expect(r.totalPaid).toBe(472000);
    });

    test('deve ajustar a última parcela para baixo quando o arredondamento fica acima da dívida', () => {
      const r = calculateConsortium({
        creditValue: 300000, loanTermMonths: 180, adminRateTotal: 0.16, reserveFund: 0.02,
      });
      expect(r.monthlyPayment).toBe(1966.67);
      expect(r.evolution.at(-1).payment).toBe(1966.07);
      expect(r.totalPaid).toBe(354000);
    });

    test('não deve criar um mês extra quando as parcelas arredondadas já quitam o resto do lance', () => {
      const r = calculateConsortium({
        creditValue: 300000, loanTermMonths: 180, adminRateTotal: 0.16, reserveFund: 0.02,
        initialBid: 19666.66,
      });
      expect(r.estimatedTermWithBid).toBe(170);
      expect(r.evolution.at(-1).payment).toBe(1966.11);
      expect(r.totalPaid).toBe(354000);
    });

    test('deve cobrar a parcela arredondada em todos os meses, exceto o último', () => {
      const r = calculateConsortium({ ...base, initialBid: 50000 });
      expect(r.evolution.slice(0, -1).every((e) => e.payment === r.monthlyPayment)).toBe(true);
    });

    test('a soma das parcelas + lance deve fechar exatamente com crédito + taxas', () => {
      for (const initialBid of [0, 1000, 2183.33, 50000, 123456.78]) {
        for (const loanTermMonths of [60, 120, 180, 240]) {
          const r = calculateConsortium({ ...base, loanTermMonths, initialBid });
          const debtCents = toCents(300000 + r.totalTaxes);
          expect(sumCents(r) + toCents(initialBid)).toBe(debtCents);
          expect(toCents(r.totalPaid)).toBe(debtCents);
          expect(r.evolution.at(-1).balance).toBe(0);
        }
      }
    });
  });

  describe('mês de contemplação', () => {
    test('deve usar metade do prazo quando não é informado', () => {
      expect(calculateConsortium({ ...base }).contemplationMonth).toBe(90);
    });

    test('deve arredondar a metade para cima quando o prazo é ímpar', () => {
      expect(calculateConsortium({ ...base, loanTermMonths: 61 }).contemplationMonth).toBe(31);
    });

    test('deve usar o mês informado', () => {
      expect(calculateConsortium({ ...base, contemplationMonth: 30 }).contemplationMonth).toBe(30);
    });

    test('deve limitar ao prazo com lance quando o lance quita antes do mês informado', () => {
      const r = calculateConsortium({ ...base, initialBid: 50000, contemplationMonth: 175 });
      expect(r.estimatedTermWithBid).toBeLessThan(175);
      expect(r.contemplationMonth).toBe(r.estimatedTermWithBid);
    });

    test('não deve alterar parcela, prazo nem custo', () => {
      const padrao = calculateConsortium({ ...base });
      const cedo = calculateConsortium({ ...base, contemplationMonth: 1 });
      expect(cedo.monthlyPayment).toBe(padrao.monthlyPayment);
      expect(cedo.estimatedTermWithBid).toBe(padrao.estimatedTermWithBid);
      expect(cedo.totalPaid).toBe(padrao.totalPaid);
    });

    test.each([0, 181, 1.5])('deve lançar erro quando o mês informado é %p', (contemplationMonth) => {
      expect(() => calculateConsortium({ ...base, contemplationMonth })).toThrow(/contemplação/i);
    });
  });

  describe('recursos próprios (crédito menor que o valor do imóvel)', () => {
    const sumPayments = (r) => r.evolution.reduce((sum, e) => sum + e.payment, 0);

    test('não deve haver complemento quando o valor do imóvel não é informado', () => {
      const r = calculateConsortium({ ...base });
      expect(r.ownResources).toBe(0);
    });

    test('não deve haver complemento quando o crédito é igual ao valor do imóvel', () => {
      const r = calculateConsortium({ ...base, propertyValue: 300000 });
      expect(r.ownResources).toBe(0);
      expect(r.totalPaid).toBeCloseTo(sumPayments(r), 0);
    });

    test('deve somar a diferença entre imóvel e crédito ao custo total', () => {
      const igual = calculateConsortium({ ...base, propertyValue: 300000 });
      const r = calculateConsortium({ ...base, propertyValue: 400000 });
      expect(r.ownResources).toBe(100000);
      expect(r.totalPaid).toBeCloseTo(igual.totalPaid + 100000, 2);
    });

    test('não deve alterar parcela, taxas nem prazo por causa do complemento', () => {
      const igual = calculateConsortium({ ...base, propertyValue: 300000 });
      const r = calculateConsortium({ ...base, propertyValue: 400000 });
      expect(r.monthlyPayment).toBe(igual.monthlyPayment);
      expect(r.totalTaxes).toBe(igual.totalTaxes);
      expect(r.estimatedTermWithBid).toBe(igual.estimatedTermWithBid);
    });

    test('deve somar lance e complemento ao custo total quando há os dois', () => {
      const r = calculateConsortium({ ...base, propertyValue: 400000, initialBid: 50000 });
      expect(r.totalPaid).toBeCloseTo(sumPayments(r) + 50000 + 100000, 0);
    });

    test('deve lançar erro quando o crédito é maior que o valor do imóvel', () => {
      expect(() => calculateConsortium({ ...base, propertyValue: 250000 })).toThrow(/imóvel/i);
    });
  });

  describe('cenário completo (crédito 500k, lance 100k, prazo 180 meses)', () => {
    const r = calculateConsortium({
      creditValue: 500000,
      loanTermMonths: 180,
      adminRateTotal: 0.30,
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

    test.each([-0.01, 1.01])(
      'deve lançar erro quando a taxa de administração total é %p (fora de 0 a 1)',
      (adminRateTotal) => {
        expect(() => calculateConsortium({ ...base, adminRateTotal })).toThrow(/administração/i);
      }
    );

    test('deve lançar erro quando o lance é maior ou igual ao crédito', () => {
      expect(() => calculateConsortium({ ...base, initialBid: 300000 })).toThrow(/lance/i);
    });
  });
});

describe('consistência do custo total com o financiamento', () => {
  const { calculateFinancing } = require('../src/services/financingService');
  const sumPayments = (r) => r.evolution.reduce((sum, e) => sum + e.payment, 0);

  test('deve contar o valor pago à vista (entrada / lance) no custo total das duas opções', () => {
    const upfront = 50000;
    const fin = calculateFinancing({
      propertyValue: 300000,
      downPayment: upfront,
      loanTermMonths: 180,
      interestRateAnnual: 0.09,
      system: 'PRICE',
    });
    const cons = calculateConsortium({ ...base, initialBid: upfront });

    expect(fin.totalPaid - sumPayments(fin)).toBeCloseTo(upfront, 0);
    expect(cons.totalPaid - sumPayments(cons)).toBeCloseTo(upfront, 0);
  });
});
