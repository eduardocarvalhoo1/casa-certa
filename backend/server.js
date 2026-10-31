
require('dotenv').config();

const app = require('./src/app');
const { sequelize, connectDB } = require('./src/config/database');

require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    const isProduction = process.env.NODE_ENV === 'production';
    await sequelize.sync({ alter: !isProduction });

    console.log(
      `Modelos sincronizados com o banco de dados${isProduction ? '' : ' (alter: ativo)'}.`
    );

    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    process.on('SIGINT', () => {
      console.log('\nEncerrando servidor...');

      server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(
      'Não foi possível iniciar o servidor:',
      error.message
    );

    process.exitCode = 1;
  }
}

startServer();
