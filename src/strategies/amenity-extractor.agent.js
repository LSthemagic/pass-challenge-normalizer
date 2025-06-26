import { openai } from "../utils/openai-client.js";
import { getAmenityListForAI } from '../services/mapping.service.js';

const MASTER_AMENITIES_LIST_FOR_AI = getAmenityListForAI();

/**
 * Analisa o nome e a descrição de um quarto usando uma abordagem JSON direta e robusta.
 * @param {string | null} roomName O nome do quarto.
 * @param {string | null} description A descrição detalhada do quarto.
 * @returns {Promise<string[]>} Um array de códigos de amenities.
 */
export async function extractAmenities(roomName, description) {
    if (!roomName && !description) {
        console.log("[Agente IA - Amenities] Nenhum texto fornecido para análise.");
        return [];
    }

    const combinedText = `Nome do Quarto: ${roomName || 'Não informado'}. Descrição: ${description || 'Não informada'}`;
    // console.log(`[Agente IA - Amenities] Analisando texto: "${combinedText.substring(0, 100)}..."`);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            // 1. FORÇAMOS A RESPOSTA A SER UM JSON VÁLIDO
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `Você é um especialista em extrair dados de textos de hotelaria. Analise o texto do quarto fornecido e identifique TODAS as comodidades (amenities) mencionadas que constam na lista de referência.

REGRAS:
- Sua resposta DEVE ser um objeto JSON válido.
- O objeto JSON deve ter uma única chave: "found_codes".
- O valor de "found_codes" deve ser um array de strings contendo os CÓDIGOS das amenities encontradas.
- Use APENAS os códigos da lista de referência.
- Analise de forma semântica (ex: "ambiente climatizado" corresponde a "Ar Condicionado").
- Se nenhuma amenity for encontrada, retorne um array vazio: {"found_codes": []}`
                },
                {
                    role: "user",
                    content: `
                    - Lista de Referência (com code e name): ${JSON.stringify(MASTER_AMENITIES_LIST_FOR_AI)}

                    - Texto para Analisar:
                    "${combinedText}"
                    `
                }
            ],
            // 2. REMOVEMOS COMPLETAMENTE 'tools' e 'tool_choice'
        });

        const responseContent = completion.choices[0].message.content;
        
        if (responseContent) {
            // 3. FAZEMOS O PARSE DO CONTEÚDO DA MENSAGEM DIRETAMENTE
            const result = JSON.parse(responseContent);
            const amenityCodes = result.found_codes || [];
            
            console.log(`[Agente IA - Amenities] Análise Direta Concluída. Amenities: [${amenityCodes.join(', ')}]`);
            return amenityCodes.filter(Boolean); // Filtro de segurança extra
        }

        return [];

    } catch (error) {
        console.error("[Agente IA - Amenities] Erro ao extrair amenities com abordagem direta:", error);
        return [];
    }
}