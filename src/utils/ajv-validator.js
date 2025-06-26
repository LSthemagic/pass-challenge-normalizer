// utils/ajv-validator.js
import Ajv from "ajv";

export const OUTPUT_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "hotel": {
      "type": "array",
      "items": {
        "type": "object",
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
          "stars": { "type": "number" },
          "address": {
            "type": "object",
            "properties": {
              "street": { "type": ["string", "null"] },
              "neighborhood": { "type": ["string", "null"] },
              "city": { "type": ["string", "null"] },
              "state": { "type": ["string", "null"] },
              "country": { "type": ["string", "null"] },
              "zipcode": { "type": ["string", "null"] },
              "coordinates": {
                "type": "object",
                "properties": {
                  "lat": { "type": "number" },
                  "lng": { "type": "number" }
                }
              }
            }
          },
          "connector": { "type": "string" },
          "images": { "type": "array", "items": { "type": "string" } },
          "facilities": { "type": "array", "items": { "type": "string" } },
          "rooms": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": { "type": ["string", "null"] },
                "occupancy": { "type": ["string", "null"] },
                "name": { "type": "string" },
                "amenities": { "type": "array", "items": { "type": "string" } },
                "rates": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "rate_id": { "type": "string" },
                      "board": { "type": ["string", "null"] },
                      "price": {
                        "type": "object",
                        "properties": {
                          "net": { "type": "number" },
                          "total": { "type": "number" },
                          "markup": { "type": ["number", "null"] },
                          "commission": { "type": ["number", "null"] },
                          "currency": { "type": ["string", "null"] }
                        }
                      },
                      "payment": {
                        "type": ["array", "null"],
                        "items": { "type": "string" }
                      },
                      "cancellation": {
                        "type": "object",
                        "properties": {
                          "amount": { "type": ["number", "null"] },
                          "from": { "type": ["string", "null"], "format": "date-time" },
                          "deadline": { "type": ["string", "null"], "format": "date-time" }
                        }
                      },
                      "allotment": { "type": ["integer", "null"] }
                    }
                  }
                }
              }
            }
          }
        },
        "required": ["id", "name", "rooms"]
      }
    }
  },
  "required": ["hotel"]
};

const ajv = new Ajv({ useDefaults: true });
export const validateFinalOutput = ajv.compile(OUTPUT_SCHEMA);

// const ajv = new Ajv({ allowUnionTypes: true }); 
// addFormats(ajv); 
// export const validateFinalOutput = ajv.compile(OUTPUT_SCHEMA);