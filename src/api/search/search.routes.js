import { fetchOmnibeesData, fetchHotelbedsData, fetchB2BData } from '../../services/provider.service.js';
import { runNormalizationPipeline } from '../../core/strategies/orchestrator.js';
import { generateFilterObject } from '../../services/filter.service.js'; // Vamos mover a função para um serviço

// NOTA: Mova a função generateFilterObject que criámos para um novo ficheiro
// 'src/services/filter.service.js' para manter o código organizado.

async function searchRoutes(fastify, options) {
  fastify.post('/search', async (request, reply) => {
    try {
      // 1. Busca os dados brutos de todos os provedores em paralelo
      const [omnibeesRawData, hotelbedsRawData, b2bRawData] = await Promise.all([
        fetchOmnibeesData(request.body),
        fetchHotelbedsData(request.body),
        fetchB2BData(request.body)
      ]);
      // console.log("b2b \n",b2bRawData)
      // 2. Normaliza os dados de cada provedor em paralelo
      const [omnibeesHotels, hotelbedsHotels, b2bHotels] = await Promise.all([
        runNormalizationPipeline(omnibeesRawData, 'omnibees'),
        runNormalizationPipeline(hotelbedsRawData, 'hotelbeds'),
        runNormalizationPipeline(b2bRawData, 'b2b')
      ]);


      const allNormalizedHotels = [omnibeesHotels, hotelbedsHotels, b2bHotels].flat();
      

      const filterData = generateFilterObject(allNormalizedHotels);

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
