import { openai } from "../utils/openai-client.js";
import { MASTER_FACILITIES_LIST_FOR_AI } from '../providers/master-data/facilities.data.js';
import { facilitiesMap } from '../providers/master-data/facilities.data.js';

export async function extractFacilities(hotelText) {
    if (!hotelText) return [];

    const foundCodes = new Set();
    for (const [code, name] of facilitiesMap.entries()) {
        // Cria uma busca simples e um pouco mais flexível para cada amenidade
        const keywords = name.toLowerCase().split(' ');
        if (keywords.some(keyword => hotelText.includes(keyword))){
            foundCodes.add(code);
        }
    }

    // Se o parser local já encontrou resultados, podemos retorná-los
    // e economizar uma chamada de IA.
    if (foundCodes.size > 0) {
        console.log(`[facilities Extractor] Modo Rápido encontrou: [${Array.from(foundCodes).join(', ')}]`);
        return Array.from(foundCodes);
    }

    // --- 2. TENTATIVA INTELIGENTE (FALLBACK PARA IA) ---
    // Só chegamos aqui se o parser rápido não encontrou nada.
    console.log(`[Amenity Extractor] Modo Rápido não encontrou nada. Usando IA como fallback...`);

    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você analisa descrições de hotéis para extrair uma lista de instalações (facilities) com base em uma lista padrão." },
                { role: "user", content: `Lista Padrão de Instalações: ${JSON.stringify(MASTER_FACILITIES_LIST_FOR_AI)}. Analise o texto a seguir e retorne os códigos de todas as instalações encontradas: "${hotelText}"` }
            ],
            tools: [{
                type: "function",
                function: {
                    name: "report_hotel_facilities",
                    parameters: {
                        type: "object",
                        properties: { "found_facilities": { type: "array", items: { type: "object", properties: { "code": { type: "string", enum: MASTER_FACILITIES_LIST_FOR_AI.map(f => f.code) } } } } },
                        required: ["found_facilities"]
                    }
                }
            }],
            tool_choice: { type: "function", function: { name: "report_hotel_facilities" } },
        });

        const args = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);
        return (args.found_facilities || []).map(f => f.code);

    } catch (error) {
        console.error("[Agente IA] Erro ao extrair facilities:", error);
        return [];
    }
}