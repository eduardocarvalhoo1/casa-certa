const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const userRoutes = require('./routes/UserRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const authRoutes = require('./routes/AuthRoutes');


require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
      tagsSorter: (a, b) => {
        const order = ['Users', 'Auth', 'Simulations'];
        return order.indexOf(a) - order.indexOf(b);
      },
    },
  })
);
app.use('/users', userRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;