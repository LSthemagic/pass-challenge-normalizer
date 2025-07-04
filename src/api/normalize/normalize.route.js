import { runNormalizationPipeline } from '../../core/strategies/orchestrator.js';
import { normalizeSchema } from './normalize.schemas.js';

async function normalizeRoutes(fastify, options) {
  fastify.post('/normalize', { schema: normalizeSchema }, async (request, reply) => {
    const { provider, hotels, rawData = hotels } = request.body;
    
    // 1. Chama o pipeline e armazena o resultado (o array de hotéis)
    const normalizedHotelsArray = await runNormalizationPipeline(rawData, provider);
    // console.log('[ROTA] Dados recebidos do orquestrador:', normalizedHotelsArray);
    return {
      data: normalizedHotelsArray
    };
  });
}

export default normalizeRoutes;
