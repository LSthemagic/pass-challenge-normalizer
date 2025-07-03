import fastify from 'fastify';
import sensible from '@fastify/sensible';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

import normalizeRouter from './api/normalize/normalize.route.js'; 
import searchRoutes from './api/search/search.routes.js';
// Cria a instância do Fastify
// A opção 'bodyLimit' substitui o express.json({ limit: '100mb' })
const app = fastify({
  logger: true, // Altamente recomendado para desenvolvimento
  bodyLimit: 100 * 1024 * 1024, // 100MB em bytes
});

// --- REGISTRO DE PLUGINS ESSENCIAIS ---

// Adiciona utilitários para respostas HTTP (reply.notFound(), reply.badRequest(), etc.)
app.register(sensible);

// Adiciona headers de segurança importantes para a aplicação
app.register(helmet);

// Habilita e configura o CORS (Cross-Origin Resource Sharing)
// A configuração padrão é um bom começo
app.register(cors, {
  origin: '*', // Em produção, restrinja para o domínio do seu front-end
});


// --- REGISTRO DE ROTAS ---

// Rota de "health check" para verificar se o serviço está no ar
app.get('/', async (request, reply) => {
  reply.send({ message: '🚀 Integration Hub API está no ar!' });
});

// Registra seu router principal com um prefixo
// Todas as rotas dentro de 'normalizeRouter' começarão com /api
app.register(normalizeRouter, { prefix: '/api' });
app.register(searchRoutes, { prefix: '/api' });

// Exporta a instância do app para ser usada pelo server.js
export default app;
