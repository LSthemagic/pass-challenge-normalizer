import { boardMap } from "../providers/master-data/board.data.js"
import { amenitiesMap, MASTER_AMENITIES_LIST_FOR_AI } from '../providers/master-data/amenities.data.js';
import { facilitiesMap, MASTER_FACILITIES_LIST_FOR_AI } from '../providers/master-data/facilities.data.js';
import { occupancyMap, MASTER_OCCUPANCY_LIST_FOR_AI } from '../providers/master-data/occupancy.data.js';
import { roomTypesMap, MASTER_ROOM_TYPE_LIST_FOR_AI } from '../providers/master-data/room-types.data.js';
import { countriesMap } from '../providers/master-data/country.data.js';
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