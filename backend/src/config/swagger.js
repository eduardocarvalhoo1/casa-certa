const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const PORT = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CasaCerta API',
      version: '1.0.0',
      description:
        'Núcleo de simulação e recomendação do CasaCerta: financiamento (SAC/PRICE), consórcio e recomendação ponderada por objetivo.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor local de desenvolvimento',
      },
    ],
    tags: [
      { name: 'Users', description: 'Cadastro de usuários' },
      { name: 'Auth', description: 'Autenticação de usuários' },
      { name: 'Simulations', description: 'Simulações de financiamento e consórcio' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SimulationInput: {
          type: 'object',
          required: [
            'name',
            'objective',
            'system',
            'propertyValue',
            'financing',
            'consortium',
          ],
          properties: {
            name: { type: 'string', example: 'Apartamento Centro' },
            objective: {
              type: 'string',
              enum: ['COMPRAR_IMOVEL', 'INVESTIR', 'REFINANCIAR'],
              example: 'COMPRAR_IMOVEL',
            },
            system: {
              type: 'string',
              enum: ['SAC', 'PRICE'],
              description: 'Sistema de amortização do financiamento.',
              example: 'SAC',
            },
            propertyValue: { type: 'number', example: 300000 },
            financing: {
              type: 'object',
              required: ['downPayment', 'termYears', 'interestRateAnnual'],
              properties: {
                downPayment: { type: 'number', example: 60000 },
                termYears: {
                  type: 'integer',
                  description: 'Prazo em anos (convertido para meses na API).',
                  example: 30,
                },
                interestRateAnnual: {
                  type: 'number',
                  description: 'Taxa de juros ao ano (ex.: 0.09 = 9%).',
                  example: 0.09,
                },
              },
            },
            consortium: {
              type: 'object',
              required: [
                'creditValue',
                'termMonths',
                'adminRateTotal',
                'reserveFund',
              ],
              properties: {
                creditValue: {
                  type: 'number',
                  description:
                    'Valor da carta de crédito. Deve ser <= propertyValue; a diferença é tratada como recursos próprios.',
                  example: 300000,
                },
                termMonths: { type: 'integer', example: 180 },
                adminRateTotal: {
                  type: 'number',
                  description:
                    'Taxa de administração total do plano, entre 0 e 1 (ex.: 0.16 = 16% sobre o crédito).',
                  example: 0.16,
                },
                reserveFund: {
                  type: 'number',
                  description: 'Fundo de reserva (ex.: 0.01 = 1%).',
                  example: 0.01,
                },
                initialBid: {
                  type: 'number',
                  description: 'Lance inicial opcional (reduz o prazo).',
                  example: 50000,
                },
                contemplationMonth: {
                  type: 'integer',
                  description:
                    'Mês estimado de contemplação (opcional, de 1 ao prazo). Padrão: metade do prazo.',
                  example: 60,
                },
              },
            },
          },
        },

        FinancingResult: {
          type: 'object',
          properties: {
            financeAmount: { type: 'number', example: 240000 },
            initialPayment: { type: 'number', example: 2100.55 },
            finalPayment: { type: 'number', example: 680.12 },
            totalPaid: {
              type: 'number',
              description: 'Custo total: entrada + soma das parcelas.',
              example: 580000,
            },
            totalInterest: { type: 'number', example: 280000 },
            evolution: {
              type: 'array',
              items: { $ref: '#/components/schemas/FinancingInstallment' },
            },
          },
        },
        FinancingInstallment: {
          type: 'object',
          properties: {
            month: { type: 'integer', example: 1 },
            payment: { type: 'number', example: 2100.55 },
            interest: { type: 'number', example: 1800.0 },
            amortization: { type: 'number', example: 300.55 },
            balance: { type: 'number', example: 239699.45 },
          },
        },

        ConsortiumResult: {
          type: 'object',
          properties: {
            monthlyPayment: { type: 'number', example: 1850.0 },
            ownResources: {
              type: 'number',
              description:
                'Complemento com recursos próprios (propertyValue - creditValue). null em simulações antigas.',
              nullable: true,
              example: 0,
            },
            totalPaid: {
              type: 'number',
              description: 'Custo total: lance + soma das parcelas + recursos próprios.',
              example: 333000,
            },
            totalTaxes: { type: 'number', example: 33000 },
            estimatedTermWithBid: { type: 'integer', example: 150 },
            contemplationMonth: {
              type: 'integer',
              nullable: true,
              description:
                'Mês de contemplação usado na recomendação: o informado ou metade do prazo, limitado ao prazo com lance. null em simulações antigas.',
              example: 90,
            },
            evolution: {
              type: 'array',
              items: { $ref: '#/components/schemas/ConsortiumInstallment' },
            },
          },
        },
        ConsortiumInstallment: {
          type: 'object',
          properties: {
            month: { type: 'integer', example: 1 },
            payment: { type: 'number', example: 1850.0 },
            balance: { type: 'number', example: 331150.0 },
          },
        },

        Recommendation: {
          type: 'object',
          properties: {
            recommendedOption: {
              type: 'string',
              enum: ['FINANCING', 'CONSORTIUM'],
              example: 'FINANCING',
            },
            financingScore: { type: 'number', example: 87.5 },
            consortiumScore: { type: 'number', example: 72.3 },
            financingWeights: {
              type: 'object',
              example: { totalCost: 0.4, payoffTerm: 0.2, timeToProperty: 0.15, initialPayment: 0.25 },
            },
            consortiumWeights: {
              type: 'object',
              example: { totalCost: 0.4, payoffTerm: 0.2, timeToProperty: 0.15, initialPayment: 0.25 },
            },
          },
        },

        SimulationStoredInput: {
          type: 'object',
          description:
            'Entradas usadas no cálculo. Campos ficam null em simulações criadas antes de as entradas serem salvas.',
          properties: {
            financing: {
              type: 'object',
              properties: {
                downPayment: { type: 'number', nullable: true, example: 60000 },
                termYears: { type: 'integer', nullable: true, example: 30 },
                interestRateAnnual: { type: 'number', nullable: true, example: 0.09 },
              },
            },
            consortium: {
              type: 'object',
              properties: {
                creditValue: { type: 'number', nullable: true, example: 300000 },
                termMonths: { type: 'integer', nullable: true, example: 180 },
                adminRateTotal: { type: 'number', nullable: true, example: 0.16 },
                reserveFund: { type: 'number', nullable: true, example: 0.01 },
                initialBid: {
                  type: 'number',
                  nullable: true,
                  description: '0 quando não há lance.',
                  example: 50000,
                },
              },
            },
          },
        },

        Comparison: {
          type: 'object',
          description: 'Indicadores lado a lado (financiamento x consórcio).',
          properties: {
            initialPayment: { $ref: '#/components/schemas/ComparisonPair' },
            totalCost: { $ref: '#/components/schemas/ComparisonPair' },
            interestOrTaxes: { $ref: '#/components/schemas/ComparisonPair' },
            timeframe: {
              allOf: [{ $ref: '#/components/schemas/ComparisonPair' }],
              description: 'Prazo para quitar, em meses.',
            },
            timeToProperty: {
              allOf: [{ $ref: '#/components/schemas/ComparisonPair' }],
              description:
                'Meses até ter o imóvel: 0 no financiamento e o mês de contemplação no consórcio (null em simulações antigas).',
            },
            downPaymentOrBid: {
              allOf: [{ $ref: '#/components/schemas/ComparisonPair' }],
              description:
                'Pago com recursos próprios: entrada (financiamento) e lance + complemento (consórcio). null em simulações antigas.',
            },
          },
        },
        ComparisonPair: {
          type: 'object',
          properties: {
            financing: { type: 'number', nullable: true },
            consortium: { type: 'number', nullable: true },
          },
        },

        SimulationSummary: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Apartamento Centro' },
            objective: { type: 'string', example: 'COMPRAR_IMOVEL' },
            propertyValue: { type: 'number', example: 300000 },
            createdAt: { type: 'string', format: 'date-time' },
            recommendedOption: {
              type: 'string',
              enum: ['FINANCING', 'CONSORTIUM'],
              example: 'FINANCING',
            },
          },
        },

        // ---- Autenticação ----
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'maria@email.com' },
            password: { type: 'string', format: 'password', example: 'senhaSegura123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Login realizado com sucesso.' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },

        // ---- Usuário ----
        UserInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@email.com' },
            password: { type: 'string', format: 'password', example: 'senhaSegura123' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', format: 'email', example: 'maria@email.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ---- Erro padrão ----
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Mensagem de erro.' },
            details: {
              type: 'array',
              items: { type: 'string' },
              example: ['O campo propertyValue é obrigatório.'],
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js').split(path.sep).join('/')],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
