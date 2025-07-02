import { boardMap } from "../core/master-data/board.data.js"
import { amenitiesMap, MASTER_AMENITIES_LIST_FOR_AI } from '../core/master-data/amenities.data.js';
import { facilitiesMap, MASTER_FACILITIES_LIST_FOR_AI } from '../core/master-data/facilities.data.js';
import { occupancyMap, MASTER_OCCUPANCY_LIST_FOR_AI } from '../core/master-data/occupancy.data.js';
import { roomTypesMap, MASTER_ROOM_TYPE_LIST_FOR_AI } from '../core/master-data/room-types.data.js';
import { countriesMap } from '../core/master-data/country.data.js';
// import { cardFlagsMap } from '../providers/master-data/card-flags.data.js';
// import { currenciesMap } from '../providers/master-data/currency.data.js';
// import { languagesMap } from '../providers/master-data/language.data.js';
// import { paymentMethodsMap } from '../providers/master-data/payment-methods.data.js';

export function getAmenityListForAI() {
    return MASTER_AMENITIES_LIST_FOR_AI;
}

export function getFacilityListForAI() {
    return MASTER_FACILITIES_LIST_FOR_AI;
}

export function getOccupancyListForAI() {
    return MASTER_OCCUPANCY_LIST_FOR_AI;
}

export function getRoomTypeListForAI() {
    return MASTER_ROOM_TYPE_LIST_FOR_AI;
}

/**
 * Retorna os detalhes de um regime de alimentação a partir de um código padrão.
 * @param {string} code O código padrão do regime (ex: "BB").
 * @returns {Object | null} O objeto com title/description ou null.
 */
export function getBoardDetails(code){
    return boardMap.get(code) || null;
}

export function getCountryName(isoCode) {
    return countriesMap.get(isoCode) || null;
}

export async function getMapperForProvider(providerName) {
  try {
    // Constrói o caminho para o arquivo do mapper dinamicamente
    const modulePath = `../integrations/${providerName}/${providerName}.mapper.js`;
    
    // Usa import() para carregar o módulo. O 'await' resolve a Promise.
    const mapperModule = await import(modulePath);
    
    return mapperModule;
  } catch (error) {
    console.error(`Erro ao carregar o mapper para o provedor '${providerName}':`, error);
    throw new Error(`Mapper para o provedor '${providerName}' não encontrado ou inválido.`);
  }
}

export async function getConfigForProvider(providerName) {
  try {
    const modulePath = `../integrations/${providerName}/${providerName}.config.js`;
    const configModule = await import(modulePath);
    // Usamos 'default' se você estiver usando 'export default' no seu arquivo de config
    return configModule.default || configModule; 
  } catch (error) {
    console.error(`Erro ao carregar a configuração para o provedor '${providerName}':`, error);
    throw new Error(`Configuração para o provedor '${providerName}' não encontrada ou inválida.`);
  }
}