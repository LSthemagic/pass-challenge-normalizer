import { openai } from "../utils/openai-client.js";
import { MASTER_OCCUPANCY_LIST_FOR_AI } from '../providers/master-data/occupancy.data.js';

export async function extractOccupancyCode(roomName, maxOccupancy) {
    if (!roomName || !maxOccupancy) return null;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Você analisa o nome de um quarto e sua capacidade máxima para determinar o código de ocupação correto a partir de uma lista padrão. A diferença entre 'Double' (D2) e 'Twin' (T2) é importante." },
                { role: "user", content: `Lista Padrão de Ocupação: ${JSON.stringify(MASTER_OCCUPANCY_LIST_FOR_AI)}. Nome do Quarto: "${roomName}". Capacidade Máxima: ${maxOccupancy}. Qual o código de ocupação mais apropriado?` }
            ],
            tools: [{
                type: "function",
                function: {
                    name: "report_occupancy_code",
                    parameters: {
                        type: "object",
                        properties: { "occupancy_code": { type: "string", enum: MASTER_OCCUPANCY_LIST_FOR_AI.map(o => o.code) } },
                        required: ["occupancy_code"]
                    }
                }
            }],
            tool_choice: { type: "function", function: { name: "report_occupancy_code" } },
        });
        
        const args = JSON.parse(completion.choices[0].message.tool_calls[0].function.arguments);
        return args.occupancy_code;

    } catch (error) {
        console.error("[Agente IA] Erro ao extrair código de ocupação:", error);
        return null;
    }
}