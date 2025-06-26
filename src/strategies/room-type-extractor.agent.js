import { openai } from "../utils/openai-client.js";
import { roomTypesMap } from '../providers/master-data/room-types.data.js';

const MASTER_ROOM_TYPE_LIST = Array.from(roomTypesMap.entries()).map(([code, name]) => ({ code, name }));

/**
 * Analisa o nome de um quarto e o classifica em um dos tipos padrão do sistema.
 * @param {string | null} roomName O nome do quarto (ex: "Superior Queen - Não Fumante").
 * @returns {Promise<string|null>} O código do tipo de quarto padrão (ex: "SU") ou null.
 */
export async function extractRoomTypeCode(roomName) {
    if (!roomName || typeof roomName !== 'string' || roomName.trim() === '') {
        return null;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Você é um especialista em análise de dados de hotelaria. Sua tarefa é classificar um nome de quarto em um dos tipos padrão fornecidos. Você deve retornar o código do tipo que melhor corresponde.`
                },
                {
                    role: "user",
                    content: `A lista de tipos de quarto padrão é: ${JSON.stringify(MASTER_ROOM_TYPE_LIST)}. Analise o seguinte nome de quarto e retorne o código do tipo mais apropriado: "${roomName}"`
                }
            ],
            tools: [{
                type: "function",
                function: {
                    name: "report_room_type",
                    description: "Reporta o código do tipo de quarto classificado.",
                    parameters: {
                        type: "object",
                        properties: {
                            "type_code": {
                                type: "string",
                                description: "O código do tipo de quarto padrão que melhor corresponde.",
                                enum: MASTER_ROOM_TYPE_LIST.map(rt => rt.code)
                            }
                        },
                        required: ["type_code"]
                    }
                }
            }],
            tool_choice: { type: "function", function: { name: "report_room_type" } },
        });

        const toolCall = completion.choices[0].message.tool_calls?.[0];
        if (toolCall) {
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const typeCode = functionArgs.type_code;
            // console.log(`[Agente IA] Nome do quarto: "${roomName}" -> Classificado como: ${typeCode}`);
            return typeCode;
        }
        return null;
    } catch (error) {
        console.error(`[Agente IA] Erro ao classificar tipo de quarto para "${roomName}":`, error);
        return null;
    }
}