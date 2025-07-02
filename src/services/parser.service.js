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


export function extractRoomTypeCode(roomName) {
    if (!roomName) return null;
    const text = roomName.toLowerCase();

    // Lista de regras em ordem de prioridade (do mais específico para o mais genérico).
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
        { code: 'SU', keywords: ['suite', 'suíte'] },
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

    // Itera sobre a lista de prioridades e retorna no primeiro match encontrado.
    for (const rule of priorityList) {
        if (rule.keywords.some(kw => text.includes(kw))) {
            return rule.code;
        }
    }

    // Retorna nulo se nenhuma palavra-chave correspondente for encontrada.
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