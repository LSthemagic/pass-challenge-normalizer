import { getProviderAdapter } from "./01-adapter.strategy.js";
import get from "lodash.get";

export function runNormalizationPipeline(rawData, providerName) {
  console.log(`[Orquestrador] Iniciando pipeline para o provedor: "${providerName}"`);


  const adapter = getProviderAdapter(providerName);


  if (!adapter || !adapter.config || !adapter.mapper) {
    console.error(`[Orquestrador] ERRO: Adaptador, config ou mapper não foi encontrado para o provedor "${providerName}".`);
    throw new Error(`O provedor "${providerName}" não é suportado ou está mal configurado.`);
  }

  console.log(`[Orquestrador] Estratégia 1: Usando mapeador manual para "${providerName}".`);


  const { config, mapper } = adapter;
  const { hotelArrayPath } = config;

  const hotelItems = get(rawData, hotelArrayPath, []);

  console.log(`[Orquestrador] Mapeando ${hotelItems.length} hotéis.`);
  
  // Executa as funções de mapeamento manual
  const finalHotels = mapper.hotel(hotelItems);

  console.log(`[Orquestrador] Mapeamento manual concluído.`);
  
  return { hotel: finalHotels};
}