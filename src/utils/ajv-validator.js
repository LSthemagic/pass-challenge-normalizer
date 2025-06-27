import Ajv from "ajv";

export const OUTPUT_SCHEMA = {
  "$schema": "http://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["hotel"],
  "properties": {
    "hotel": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name", "rooms"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "chain": {
            "type": "object",
            "properties": {
              "id": { "type": ["string", "null"] },
              "name": { "type": ["string", "null"] }
            }
          },
          "stars": { "type": "integer" },
          "address": { "type": "object" }, // Estrutura interna detalhada omitida por brevidade
          "connector": { "type": "string" },
          "images": { "type": "array", "items": { "type": "string" } },
          "facilities": { "type": "array", "items": { "type": "string" } },
          "rooms": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["name", "rates"],
              "properties": {
                "type": { "type": ["string", "null"] },
                "occupancy": { "type": ["string", "null"] },
                "name": { "type": "string" },
                "amenities": { "type": "array", "items": { "type": "string" } },
                "images": { "type": "array", "items": { "type": "string" } },
                "rates": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string" },
                      "board": { "type": ["string", "null"] },
                      "commissioned": { "type": ["object", "null"] },
                      "taxes": { "type": "array", "items": { "type": "object" } },
                      "price": { "type": "object" },
                      "payment": { "type": ["string", "null"] },
                      "cancellation": { "type": ["object", "null"] },
                      "allotment": { "type": ["integer", "null"] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const ajv = new Ajv({ useDefaults: true });
export const validateFinalOutput = ajv.compile(OUTPUT_SCHEMA);