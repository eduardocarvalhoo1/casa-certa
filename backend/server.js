const app = require('./src/app');
require('dotenv').config();

const { connectDB } = require('./src/config/database');

async function startServer() {
  try {
    // Conecta ao MySQL antes de iniciar o servidor HTTP
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

    // Encerramento organizado ao pressionar Ctrl+C
    process.on('SIGINT', () => {
      console.log('\nEncerrando servidor...');

      server.close(() => {
        console.log('Servidor encerrado.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Não foi possível iniciar o servidor:', error.message);
    process.exitCode = 1;
  }
}

startServer();
