import fastify from 'fastify';
import sensible from '@fastify/sensible';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';

import normalizeRouter from './api/normalize/normalize.route.js'; 
import searchRoutes from './api/search/search.routes.js';

const app = fastify({
  logger: true, // Altamente recomendado para desenvolvimento
  bodyLimit: 100 * 1024 * 1024, // 100MB em bytes
});

// Adiciona utilitários para respostas HTTP (reply.notFound(), reply.badRequest(), etc.)
app.register(sensible);

// Adiciona headers de segurança importantes para a aplicação
app.register(helmet);

// Habilita e configura o CORS (Cross-Origin Resource Sharing)
app.register(cors, {
  origin: '*', 
});


app.get('/', async (request, reply) => {
  reply.send({ message: '🚀 Integration Hub API está no ar!' });
});

app.register(normalizeRouter, { prefix: '/api' });
app.register(searchRoutes, { prefix: '/api' });

export default app;
