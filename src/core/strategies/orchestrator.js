import { getProviderAdapter } from "./adapter.strategy.js";
import get from "lodash.get";

export async function runNormalizationPipeline(rawData, providerName) {
  console.log(`[Orquestrador] Iniciando pipeline para o provedor: "${providerName}"`);

  const adapter = await getProviderAdapter(providerName);
  console.log("ADAPTER: \n",adapter)
  if (!adapter || !adapter.config || !adapter.mapper) {
    console.error(`[Orquestrador] ERRO: Adaptador, config ou mapper não foi encontrado para "${providerName}".`);
    throw new Error(`O provedor "${providerName}" não é suportado ou está mal configurado.`);
  }

  const { config, mapper } = adapter;
  const { hotelArrayPath } = config;
  console.log('adapter:  ', adapter);
  // console.log(rawData)
  const hotelItems = get(rawData, hotelArrayPath, []);
  // console.log(hotelItems)
  console.log(`[Orquestrador] Mapeando ${hotelItems.length} hotéis brutos.`);
  // console.log(hotelItems)
  const finalHotels = await mapper.hotel(hotelItems);
  console.log(`[Orquestrador] Mapeamento assíncrono concluído. ${finalHotels.data?.length} hotéis normalizados.`);
  // console.log(finalHotels)
  return finalHotels;
}