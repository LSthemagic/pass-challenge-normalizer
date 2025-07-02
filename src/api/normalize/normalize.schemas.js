// Define o schema de validação para a rota de normalização.
// O Fastify usará isso para validar o corpo da requisição automaticamente.
export const normalizeSchema = {
  // O 'body' descreve o formato esperado para o corpo da requisição (payload)
  body: {
    type: 'object', 
    required: ['provider', 'rawData'], // Define que ambos os campos são obrigatórios
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
      properties: {
        normalizedData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              provider: { type: 'string' },
              hotelCode: { type: 'string' },
              name: { type: 'string' },
              address: { type: 'string' },
              city: { type: 'string' },
              country: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              description: { type: 'string' },
              facilities: { type: 'array', items: { type: 'string' } },
              amenities: { type: 'array', items: { type: 'string' } },
              rooms: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    roomCode: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    images: { type: 'array', items: { type: 'string' } },
                    beds: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        count: { type: 'integer' },
                      },
                    },
                    occupancy: {
                      type: 'object',
                      properties: {
                        maxAdults: { type: 'integer' },
                        maxChildren: { type: 'integer' },
                        maxInfants: { type: 'integer' },
                      },
                    },
                    rates: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          rateCode: { type: 'string' },
                          name: { type: 'string' },
                          board: { type: 'string' },
                          cancellationPolicy: {
                            type: 'object',
                            properties: {
                              type: { type: 'string' },
                              description: { type: 'string' },
                              deadline: { type: 'string', format: 'date-time' },
                            },
                          },
                          price: {
                            type: 'object',
                            properties: {
                              amount: { type: 'number' },
                              currency: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
