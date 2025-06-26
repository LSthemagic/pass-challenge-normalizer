import { openai } from "../utils/openai-client.js";
import { getAmenityListForAI } from '../services/mapping.service.js';
import { amenitiesMap } from '../providers/master-data/amenities.data.js';


const MASTER_AMENITIES_LIST_FOR_AI = getAmenityListForAI();

/**
 * Usa uma abordagem HÍBRIDA e econômica para extrair amenities.
 */
export async function extractAmenities(roomName, description) {
    const textToAnalyze = `${roomName || ''} ${description || ''}`.toLowerCase();

    if (!textToAnalyze.trim()) {
        return [];
    }

    // --- 1. TENTATIVA RÁPIDA (PARSER LOCAL) ---
    const foundCodes = new Set();
    for (const [code, name] of amenitiesMap.entries()) {
        // Cria uma busca simples e um pouco mais flexível para cada amenidade
        const keywords = name.toLowerCase().split(' ');
        if (keywords.some(keyword => textToAnalyze.includes(keyword))) {
            foundCodes.add(code);
        }
    }

    // Se o parser local já encontrou resultados, podemos retorná-los
    // e economizar uma chamada de IA.
    if (foundCodes.size > 0) {
        console.log(`[Amenity Extractor] Modo Rápido encontrou: [${Array.from(foundCodes).join(', ')}]`);
        return Array.from(foundCodes);
    }

    // --- 2. TENTATIVA INTELIGENTE (FALLBACK PARA IA) ---
    // Só chegamos aqui se o parser rápido não encontrou nada.
    console.log(`[Amenity Extractor] Modo Rápido não encontrou nada. Usando IA como fallback...`);
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Usando o modelo econômico
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `Você é um especialista em extrair dados. Analise o texto do quarto e identifique as comodidades (amenities) que constam na lista de referência. Sua resposta DEVE ser um objeto JSON com a chave "found_codes" e um array de strings com os CÓDIGOS das amenities encontradas. Se não achar nada, retorne {"found_codes": []}.`
                },
                {
                    role: "user",
                    content: `
                    - Lista de Referência: ${JSON.stringify(getAmenityListForAI())}
                    - Texto para Analisar: "${textToAnalyze}"
                    `
                }
            ],
        });

        const result = JSON.parse(completion.choices[0].message.content);
        const codes = result.found_codes || [];
        console.log(`[Agente IA - Amenities] Análise Concluída. Amenities: [${codes.join(', ')}]`);
        return codes.filter(Boolean);

    } catch (error) {
        console.error("[Agente IA - Amenities] Erro:", error);
        return [];
    }
}

/**
 * Analisa o nome e a descrição de um quarto usando uma abordagem JSON direta e robusta.
 * @param {string | null} roomName O nome do quarto.
 * @param {string | null} description A descrição detalhada do quarto.
 * @returns {Promise<string[]>} Um array de códigos de amenities.
 */
// export async function extractAmenities(roomName, description) {
//     if (!roomName && !description) {
//         console.log("[Agente IA - Amenities] Nenhum texto fornecido para análise.");
//         return [];
//     }

//     const combinedText = `Nome do Quarto: ${roomName || 'Não informado'}. Descrição: ${description || 'Não informada'}`;
//     // console.log(`[Agente IA - Amenities] Analisando texto: "${combinedText.substring(0, 100)}..."`);

//     try {
//         const completion = await openai.chat.completions.create({
//             model: "gpt-4o",
//             // 1. FORÇAMOS A RESPOSTA A SER UM JSON VÁLIDO
//             response_format: { type: "json_object" },
//             messages: [
//                 {
//                     role: "system",
//                     content: `Você é um especialista em extrair dados de textos de hotelaria. Analise o texto do quarto fornecido e identifique TODAS as comodidades (amenities) mencionadas que constam na lista de referência.

// REGRAS:
// - Sua resposta DEVE ser um objeto JSON válido.
// - O objeto JSON deve ter uma única chave: "found_codes".
// - O valor de "found_codes" deve ser um array de strings contendo os CÓDIGOS das amenities encontradas.
// - Use APENAS os códigos da lista de referência.
// - Analise de forma semântica (ex: "ambiente climatizado" corresponde a "Ar Condicionado").
// - Se nenhuma amenity for encontrada, retorne um array vazio: {"found_codes": []}`
//                 },
//                 {
//                     role: "user",
//                     content: `
//                     - Lista de Referência (com code e name): ${JSON.stringify(MASTER_AMENITIES_LIST_FOR_AI)}

//                     - Texto para Analisar:
//                     "${combinedText}"
//                     `
//                 }
//             ],
//             // 2. REMOVEMOS COMPLETAMENTE 'tools' e 'tool_choice'
//         });

//         const responseContent = completion.choices[0].message.content;
        
//         if (responseContent) {
//             // 3. FAZEMOS O PARSE DO CONTEÚDO DA MENSAGEM DIRETAMENTE
//             const result = JSON.parse(responseContent);
//             const amenityCodes = result.found_codes || [];
            
//             console.log(`[Agente IA - Amenities] Análise Direta Concluída. Amenities: [${amenityCodes.join(', ')}]`);
//             return amenityCodes.filter(Boolean); // Filtro de segurança extra
//         }

//         return [];

//     } catch (error) {
//         console.error("[Agente IA - Amenities] Erro ao extrair amenities com abordagem direta:", error);
//         return [];
//     }
// }