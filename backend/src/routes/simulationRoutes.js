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

/**
 * @swagger
 * /api/simulations:
 *   get:
 *     summary: Lista o histórico de simulações de um usuário
 *     tags: [Simulations]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário dono das simulações.
 *     responses:
 *       200:
 *         description: Lista de simulações (resumo).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimulationSummary'
 *       400:
 *         description: Parâmetro userId ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', SimulationController.listSimulations);

/**
 * @swagger
 * /api/simulations/{id}:
 *   get:
 *     summary: Detalha uma simulação (resultados + recomendação)
 *     tags: [Simulations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da simulação.
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário dono da simulação.
 *     responses:
 *       200:
 *         description: Detalhe da simulação.
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
 *       400:
 *         description: Parâmetros inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Simulação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', SimulationController.getSimulation);

module.exports = router;
