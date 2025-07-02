import { runNormalizationPipeline } from '../../core/strategies/orchestrator.js'; // Ajuste o caminho se necessário
import { normalizeSchema } from './normalize.schemas.js';

/**
 * Define as rotas para a funcionalidade de normalização.
 * Esta função é um plugin do Fastify.
 * @param {import('fastify').FastifyInstance} fastify - A instância do Fastify.
 * @param {object} options - Opções do plugin.
 */
async function normalizeRoutes(fastify, options) {

  // Define a rota POST /normalize com o schema de validação
  fastify.post('/normalize', { schema: normalizeSchema }, async (request, reply) => {
    //
    // Se o código chegou até aqui, o Fastify JÁ VALIDOU o request.body.
    // Você tem a garantia de que 'provider' e 'rawData' existem.
    // O bloco try...catch não é mais necessário para erros 500.
    //
    const { provider, hotels, rawData = hotels } = request.body;
    
    // A lógica de negócio permanece a mesma.
    // Se 'runNormalizationPipeline' lançar um erro, o Fastify o capturará
    // e retornará uma resposta de erro 500 padronizada.
    const result = await runNormalizationPipeline(rawData, provider);
    
    // Em caso de sucesso, basta retornar o resultado.
    // O Fastify se encarrega de enviar o status 200 e o JSON.
    return result;
  });
}

export default normalizeRoutes;
