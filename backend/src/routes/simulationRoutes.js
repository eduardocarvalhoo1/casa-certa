const express = require('express');
const SimulationController = require('../controllers/simulationController');
const authMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.use(authMiddleware);

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
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Token ausente, inválido ou expirado.
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
 *     summary: Lista o histórico de simulações do usuário autenticado
 *     tags: [Simulations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de simulações (resumo).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SimulationSummary'
 *       401:
 *         description: Token ausente, inválido ou expirado.
 */
router.get('/', SimulationController.listSimulations);

/**
 * @swagger
 * /api/simulations/{id}:
 *   get:
 *     summary: Detalha uma simulação do usuário autenticado (resultados + recomendação)
 *     tags: [Simulations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da simulação.
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
 *         description: Parâmetro id inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token ausente, inválido ou expirado.
 *       404:
 *         description: Simulação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', SimulationController.getSimulation);

module.exports = router;
