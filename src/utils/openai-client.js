import "dotenv/config";
import OpenAI from "openai";


if (!process.env.OPENAI_API_KEY) {
    throw new Error("A chave da API da OpenAI (OPENAI_API_KEY) não está configurada no arquivo .env");
}

/**
 * Instância única e centralizada do cliente da OpenAI.
 * Ela será importada por qualquer módulo que precise fazer chamadas à API
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});