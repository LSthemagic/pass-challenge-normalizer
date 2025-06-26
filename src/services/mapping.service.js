import { boardMap } from "../providers/master-data/board.data.js"
import { MASTER_AMENITIES_LIST_FOR_AI } from "../providers/master-data/amenities.data.js"

/**
 * Retorna os detalhes de um regime de alimentação a partir de um código padrão.
 * @param {string} code O código padrão do regime (ex: "BB").
 * @returns {Object | null} O objeto com title/description ou null.
 */
export function getBoardDetails(code){
    return boardMap.get(code) || null;
}

/**
 * Retorna a lista mestra completa de amenities para o Agente de IA.
 * @returns {Array<Object>} A lista de amenities.
 */
export function getAmenityListForAI() {
    return MASTER_AMENITIES_LIST_FOR_AI;
}