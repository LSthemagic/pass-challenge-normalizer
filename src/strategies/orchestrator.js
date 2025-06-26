import { getProviderAdapter } from "./01-adapter.strategy.js";
import get from "lodash.get";

export async function runNormalizationPipeline(rawData, providerName) {
  console.log(`[Orquestrador] Iniciando pipeline para o provedor: "${providerName}"`);

  const adapter = getProviderAdapter(providerName);

  if (!adapter || !adapter.config || !adapter.mapper) {
    console.error(`[Orquestrador] ERRO: Adaptador, config ou mapper não foi encontrado para "${providerName}".`);
    throw new Error(`O provedor "${providerName}" não é suportado ou está mal configurado.`);
  }

  const { config, mapper } = adapter;
  const { hotelArrayPath } = config;

  const hotelItems = get(rawData, hotelArrayPath, []);
  console.log(`[Orquestrador] Mapeando ${hotelItems.length} hotéis brutos.`);
  
  const finalHotels = await mapper.hotel(hotelItems);
  console.log(`[Orquestrador] Mapeamento assíncrono concluído. ${finalHotels.hotel.length} hotéis normalizados.`);
  
  return finalHotels.hotel;
}