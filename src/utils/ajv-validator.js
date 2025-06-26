import Ajv from "ajv";
import addFormats from "ajv-formats";

export const OUTPUT_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Schema de Saída Agrupado por Hotel com Ofertas",
  "description": "Define a estrutura onde cada hotel é um objeto único contendo um array de suas diferentes ofertas (quartos, preços, políticas).",
  "type": "object",
  "properties": {
    "hotel": {
      "description": "Uma lista de hotéis, cada um com suas ofertas agrupadas.",
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "id",
          "title",
          "address",
          "coordinates",
          "offers"
        ],
        "properties": {
          "id": {
            "type": "string",
            "description": "ID único do hotel."
          },
          "title": {
            "type": "string",
            "description": "Nome do hotel."
          },
          "address": {
            "type": "string",
            "description": "Endereço do hotel."
          },
          "coordinates": {
            "type": "string",
            "description": "Coordenadas no formato 'latitude,longitude'."
          },
          "star": {
            "type": ["number", "null"],
            "description": "Classificação por estrelas do hotel."
          },
          "image": {
            "type": ["string", "null"],
            "description": "URL da imagem principal."
          },
          "chain": {
            "type": ["string", "null"],
            "description": "Nome da rede de hotéis."
          },
          "zone": {
            "type": ["integer", "null"],
            "description": "ID da zona geográfica."
          },
          "connector": {
            "type": "string",
            "description": "Identificador do provedor de origem (ex: 'Omnibees')."
          },
          "amenities": {
            "type": "array",
            "description": "Lista consolidada de todas as comodidades disponíveis para este hotel.",
            "items": {
              "type": "integer"
            }
          },
          "offers": {
            "type": "array",
            "description": "Lista de todas as ofertas de quartos/tarifas disponíveis para este hotel.",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": [
                "price",
                "currency",
                "total",
                "room",
                "cancellation"
              ],
              "properties": {
                "price": {
                  "type": ["number", "string"],
                  "description": "Preço base da oferta."
                },
                "currency": {
                  "type": ["string", "null"],
                  "description": "Código da moeda (ex: BRL, EUR)."
                },
                "total": {
                  "type": ["number", "string"],
                  "description": "Preço final total da oferta."
                },
                "taxes": {
                  "type": ["array", "null"],
                  "items": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string" },
                      "description": { "type": "string" },
                      "amount": { "type": "number" },
                      "currency": { "type": "string" }
                    },
                    "required": ["name", "amount", "currency"]
                  }
                },
                "payment": {
                  "type": ["string", "integer", "null"],
                  "description": "Informações sobre formas de pagamento."
                },
                "cancellation": {
                  "type": "object",
                  "properties": {
                    "deadline": { "type": ["integer", "null"] },
                    "amount": { "type": ["number", "string", "null"] },
                    "percent": { "type": ["number", "null"] },
                    "currency": { "type": ["string", "null"] },
                    "name": { "type": ["string", "null"] },
                    "from": { "type": "string" },
                    "description": { "type": ["string", "null"] }
                  }
                },
                "board": {
                  "type": ["integer", "null"],
                  "description": "Código do tipo de pensão."
                },
                "room": {
                  "type": "string",
                  "description": "Nome/descrição do quarto da oferta."
                },
                "allotment": {
                  "type": ["integer", "null"],
                  "description": "Número de quartos disponíveis para esta oferta."
                },
                "markup": {
                  "type": "boolean"
                },
                "package": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
  },
  "required": [
    "hotel"
  ]
};

// Inicializa o AJV com as configurações necessárias
const ajv = new Ajv({ allowUnionTypes: true }); 
addFormats(ajv); 

/**
 * Uma função compilada para validar o objeto de resposta final.
 * Útil para garantir que seus mapeadores estão corretos.
 */
export const validateFinalOutput = ajv.compile(OUTPUT_SCHEMA);