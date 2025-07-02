import * as masterData from '../core/master-data/index.js'; // Importa todos os dados mestres

export const PRIORITY_FACILITIES = ["POL", "SPA", "WIFI", "PARK"];
export const PRIORITY_AMENITIES = ["BEDS", "SHWR", "SAFE", "TV", "WIFI"];

function extractCodesByKeywords(textToAnalyze, masterMap) {
    if (!textToAnalyze || !masterMap) return [];

    const text = textToAnalyze.toLowerCase();
    const foundCodes = new Set();

    for (const [code, name] of masterMap.entries()) {
        if (text.includes(name.toLowerCase())) {
            foundCodes.add(code);
        }
    }
    return Array.from(foundCodes);
}

export function extractAmenities(roomName, description) {
    const text = `${roomName || ''} ${description || ''}`;
    return extractCodesByKeywords(text, masterData.amenitiesMap);
}


export function extractFacilities(hotelText) {
    return extractCodesByKeywords(hotelText, masterData.facilitiesMap);
}


// A lista de regras original permanece a mesma
const priorityList = [
    // Suítes mais luxuosas primeiro
    { code: 'PS', keywords: ['presidential', 'presidencial'] },
    { code: 'PH', keywords: ['penthouse'] },
    { code: 'MS', keywords: ['master suite', 'suíte master'] },
    // Tipos de unidade distintos
    { code: 'VL', keywords: ['villa'] },
    { code: 'BG', keywords: ['bungalow', 'bangalô'] },
    { code: 'CB', keywords: ['cabana', 'chalé'] },
    { code: 'AP', keywords: ['apartment', 'apartamento'] },
    { code: 'LF', keywords: ['loft'] },
    { code: 'ST', keywords: ['studio', 'estúdio'] },
    // Suíte genérica (após as específicas)
    { code: 'SU', keywords: ['suite', 'suíte', 'Standard'] },
    // Tipos de quarto baseados em ocupação ou configuração
    { code: 'FR', keywords: ['family', 'familiar'] },
    { code: 'TW', keywords: ['twin'] },
    { code: 'QD', keywords: ['quadruple', 'quádruplo'] },
    { code: 'TR', keywords: ['triple', 'triplo'] },
    { code: 'DB', keywords: ['double', 'duplo', 'casal'] },
    { code: 'SG', keywords: ['single', 'individual', 'solteiro'] },
    // Tipos de acomodação compartilhada
    { code: 'DM', keywords: ['dormitory', 'dormitório'] },
    { code: 'CP', keywords: ['capsule', 'cápsula'] },
    // Tipos funcionais
    { code: 'AC', keywords: ['accessible', 'adaptado', 'pcd'] },
    { code: 'CR', keywords: ['connecting', 'conjugado'] },
];

// --- INÍCIO DA PRÉ-COMPILAÇÃO (Executa apenas uma vez) ---

// 1. Criamos um array apenas com os códigos, na mesma ordem de prioridade.
const prioritizedCodes = priorityList.map(rule => rule.code);

// 2. Criamos a string da regex. Cada grupo de keywords é envolvido por `()`
//    para criar um grupo de captura. A ordem dos grupos mantém a prioridade.
const regexPattern = priorityList
    .map(rule => `(${rule.keywords.join('|')})`)
    .join('|');

// 3. Compilamos a regex final.
// O `\b` (word boundary) garante que só encontremos palavras inteiras.
// A flag 'i' torna a busca insensível a maiúsculas/minúsculas.
const ROOM_TYPE_REGEX = new RegExp(`\\b(${regexPattern})\\b`, 'i');

// --- FIM DA PRÉ-COMPILAÇÃO ---


/**
 * Extrai o código do tipo de quarto de uma string de nome de forma altamente otimizada.
 * @param {string} roomName - O nome do quarto a ser analisado.
 * @returns {string | null} O código do tipo de quarto ou null se não for encontrado.
 */
export function extractRoomTypeCode(roomName) {
    if (!roomName) return null;

    // Executa a regex pré-compilada na string em minúsculas.
    const match = roomName.toLowerCase().match(ROOM_TYPE_REGEX);

    // Se não houver correspondência, retorna nulo.
    if (!match) return null;

    // O resultado do 'match' é um array.
    // match[0] é o texto completo correspondente.
    // match[1] é o texto capturado pelo primeiro grande grupo.
    // match[2], match[3], etc., são os textos capturados pelos grupos internos.
    // Precisamos encontrar o índice do primeiro grupo interno que não seja 'undefined'.
    // O loop começa em 2 porque match[0] e match[1] não são os grupos que queremos.
    for (let i = 2; i < match.length; i++) {
        if (match[i] !== undefined) {
            // O índice do grupo de captura (i - 2) corresponde diretamente
            // ao índice no nosso array 'prioritizedCodes'.
            return prioritizedCodes[i - 2];
        }
    }

    // Fallback caso algo inesperado ocorra (não deve acontecer se houver um match).
    return null;
}


export function extractOccupancyCode(roomName, maxOccupancy) {
    const text = roomName ? roomName.toLowerCase() : '';

    // REGRA 1: Procura por palavras-chave de alta prioridade que definem a natureza da cama.
    if (text.includes('twin')) return 'T2';
    if (text.includes('dormitory') || text.includes('dormitório')) return 'SD';
    if (text.includes('bungalow')) return 'BV';
    if (text.includes('villa')) return 'BV';

    // REGRA 2: Procura por palavras que definem a quantidade de forma explícita.
    if (text.includes('single') || text.includes('solteiro')) return 'S1';
    if (text.includes('triple') || text.includes('triplo')) return 'T3';
    if (text.includes('quadruple') || text.includes('quádruplo')) return 'Q4';
    if (text.includes('quintuple')) return 'Q5';
    if (text.includes('sextuple')) return 'Q6';
    if (text.includes('family') || text.includes('família')) return 'F6';

    // REGRA 3: Se nenhuma palavra-chave específica for encontrada, usa a capacidade numérica como fallback.
    switch (maxOccupancy) {
        case 1:
            return 'S1';
        case 2:
            return 'D2';
        case 3:
            return 'T3';
        case 4:
            return 'Q4';
        case 5:
            return 'Q5';
        case 6:
            return 'F6';
        default:
            return null;
    }
}

export function getPriorityPaymentMethod(availableMethods) {
    if (!availableMethods || availableMethods.size === 0) {
        return null;
    }
    // Define a ordem de preferência.
    const priorityOrder = [
        'credit-card',
        'pix',
        'apple-pay',
        'google-pay',
        'paypal',
        'bank-slip', // Boleto
        'debit-card',
        'bank-transfer',
        'voucher',
    ];

    for (const method of priorityOrder) {
        if (availableMethods.has(method)) {
            return method; // Retorna o primeiro método da lista de prioridade que for encontrado.
        }
    }
    
    // Se nenhum dos prioritários for encontrado, retorna o primeiro que estiver disponível.
    return availableMethods.values().next().value;
}