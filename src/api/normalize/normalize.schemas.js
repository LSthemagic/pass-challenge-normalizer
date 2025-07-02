// Define o schema de validação para a rota de normalização.
// O Fastify usará isso para validar o corpo da requisição automaticamente.
export const normalizeSchema = {
  // O 'body' descreve o formato esperado para o corpo da requisição (payload)
  body: {
    type: 'object',
    required: ['provider',], // Define que ambos os campos são obrigatórios
    properties: {
      provider: { type: 'string' }, // O provedor deve ser uma string
      rawData: {}, // 'rawData' pode ser qualquer tipo de objeto ou array.
      hotels: {} // Campo opcional 'hotels'
    },
  },
  // O 'response' descreve o formato da resposta em caso de sucesso (status 200)
  response: {
    200: {
      description: 'Resposta bem-sucedida com os dados normalizados',
      type: 'object',
      // retornar qualquer coisa
      properties: {
        data: {}
        }
    },
  },
};
