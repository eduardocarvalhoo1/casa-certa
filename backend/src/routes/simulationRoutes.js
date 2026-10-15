const express = require('express');
const SimulationController = require('../controllers/simulationController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Simulations
 *   description: Simulações de financiamento e consórcio
 */

/**
 * @swagger
 * /api/simulations:
 *   post:
 *     summary: Cria uma simulação (financiamento + consórcio + recomendação)
 *     tags: [Simulations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SimulationInput'
 *     responses:
 *       201:
 *         description: Simulação criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 simulation:
 *                   type: object
 *                 financingResult:
 *                   $ref: '#/components/schemas/FinancingResult'
 *                 consortiumResult:
 *                   $ref: '#/components/schemas/ConsortiumResult'
 *                 recommendation:
 *                   $ref: '#/components/schemas/Recommendation'
 *                 comparison:
 *                   type: object
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao criar simulação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', SimulationController.createSimulation);

module.exports = router;
