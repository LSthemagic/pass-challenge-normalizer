import { fetchOmnibeesData, fetchHotelbedsData } from '../../services/provider.service.js';
import { runNormalizationPipeline } from '../../core/strategies/orchestrator.js';
import { generateFilterObject } from '../../services/filter.service.js'; // Vamos mover a função para um serviço

// NOTA: Mova a função generateFilterObject que criámos para um novo ficheiro
// 'src/services/filter.service.js' para manter o código organizado.

async function searchRoutes(fastify, options) {
  fastify.post('/search', async (request, reply) => {
    try {
      // 1. Busca os dados brutos de todos os provedores em paralelo
      const [omnibeesRawData, hotelbedsRawData] = await Promise.all([
        fetchOmnibeesData(),
        fetchHotelbedsData()
      ]);

      // 2. Normaliza os dados de cada provedor em paralelo
      const [omnibeesHotels, hotelbedsHotels] = await Promise.all([
        runNormalizationPipeline(omnibeesRawData, 'omnibees'),
        runNormalizationPipeline(hotelbedsRawData, 'hotelbeds')
      ]);

      // 3. Combina os resultados de todos os provedores numa única lista
      // O '.flat()' garante que o resultado seja um array simples de hotéis
      const allNormalizedHotels = [omnibeesHotels, hotelbedsHotels].flat();
      
      // 4. Gera o objeto de filtro a partir da lista consolidada
      const filterData = generateFilterObject(allNormalizedHotels);

      // 5. Retorna a resposta final para o frontend
      return {
        hotel: allNormalizedHotels,
        filter: filterData
      };

    } catch (error) {
      console.error('Erro no pipeline de busca:', error);
      reply.code(500).send({ error: 'Ocorreu um erro ao processar a sua busca.' });
    }
  });
}

export default searchRoutes;
