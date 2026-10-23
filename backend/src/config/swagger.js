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
                'adminRateAnnual',
                'reserveFund',
              ],
              properties: {
                creditValue: { type: 'number', example: 300000 },
                termMonths: { type: 'integer', example: 180 },
                adminRateAnnual: {
                  type: 'number',
                  description: 'Taxa de administração ao ano (ex.: 0.02 = 2%).',
                  example: 0.02,
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
            totalPaid: { type: 'number', example: 520000 },
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
            totalPaid: { type: 'number', example: 333000 },
            totalTaxes: { type: 'number', example: 33000 },
            estimatedTermWithBid: { type: 'integer', example: 150 },
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
            financingWeights: { type: 'object', example: { totalCost: 0.4, timeframe: 0.35, initialPayment: 0.25 } },
            consortiumWeights: { type: 'object', example: { totalCost: 0.4, timeframe: 0.35, initialPayment: 0.25 } },
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
