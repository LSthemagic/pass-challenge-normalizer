import 'dotenv/config';
import app from './app.js'; // Importa a aplicação configurada

// Define a porta a partir das variáveis de ambiente ou usa um padrão
const PORT = process.env.PORT || 3000;

// Cria uma função assíncrona para iniciar o servidor
const start = async () => {
  try {
    // Inicia o servidor na porta definida e escuta em todos os IPs disponíveis
    app.listen({ port: PORT, host: '0.0.0.0' });
    
    // O logger do Fastify (se ativado no app.js) já exibe a mensagem de inicialização.
    // Se quiser uma mensagem customizada, pode usar app.log.info(...)
  } catch (err) {
    // Em caso de erro na inicialização, loga o erro e encerra o processo
    app.log.error(err);
    process.exit(1);
  }
};

// Chama a função para iniciar o servidor
start();
