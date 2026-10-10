
require('dotenv').config();

const app = require('./src/app');
const { sequelize, connectDB } = require('./src/config/database');

// Registra os models e associações antes de sincronizar as tabelas
require('./src/models');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    
    await connectDB();

    await sequelize.sync();

    console.log('Modelos sincronizados com o banco de dados.');

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

