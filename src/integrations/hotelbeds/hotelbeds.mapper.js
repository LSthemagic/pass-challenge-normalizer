import get from "lodash.get";
import * as parserService from "../../services/parser.service.js";
import * as mappingService from '../../services/mapping.service.js';
import { hotelbedsPaymentTypeDictionary } from "../hotelbeds/dictionaries/payment-types.dictionaries.js";

function mapAndGroupHotelbeds(hotelsRawData) {
    return hotelsRawData?.map((hotelData) => {
      // Lógica original para mapear quartos, mantida intacta.
      const rooms = hotelData.rooms.map((roomData) => {
        // A alteração será feita apenas dentro desta seção de mapeamento das tarifas.
        const rates = roomData.rates.map((rateData) => {
          const mainCancellationPolicy = get(
            rateData,
            "cancellationPolicies[0]",
            {}
          );
          const paymentCode = hotelbedsPaymentTypeDictionary.get(
            rateData.paymentType
          );

          // --- Início da Seção Modificada ---

          const netAmount = parseFloat(rateData.net || 0);

          // 1. O objeto 'pricing' foi substituído pelo novo objeto 'price'.
          const price = {
            net: netAmount,
            total: netAmount, // Em Hotelbeds, 'net' é o valor total sem taxas/markups explícitos
            markup: null,     // Informação não disponível no response
            taxes: 0,         // Informação não disponível no response
            commission: 0,    // Informação não disponível no response
            currency: hotelData.currency, // Moeda vinda do nível do hotel
          };

          // 2. O array 'fees' foi removido e o array 'taxes' foi adicionado (vazio, pois não há dados).
          const taxes = [];

          // 3. Adicionado o objeto 'commissioned' com valores padrão.
          const commissioned = {
            included: false,
            type: "percent",
            value: 0,
            total: 0,
          };

          // 4. O objeto de retorno da tarifa foi ajustado para o novo esquema.
          return {
            id: rateData.rateKey, //
            board: rateData.boardCode, //
            commissioned: commissioned,
            taxes: taxes,
            price: price,
            payment: paymentCode || null,
            cancellation: {
              amount: parseFloat(mainCancellationPolicy.amount || 0), //
              from: mainCancellationPolicy.from || null, //
              deadline: null, // Informação não disponível no response
            },
            allotment: rateData.allotment, //
          };
          // --- Fim da Seção Modificada ---
        });

        // Lógica original para mapear os detalhes do quarto, mantida intacta.
        return {
          type: parserService.extractRoomTypeCode(roomData.name),
          occupancy: parserService.extractOccupancyCode(
            roomData.name,
            get(roomData, "adults", 0) + get(roomData, "children", 0)
          ),
          name: roomData.name,
          amenities: [], // Não disponível
          images: [], // Não disponível
          rates: rates,
        };
      });

      // Lógica original para mapear os detalhes do hotel, mantida intacta.
      return {
        id: `HTB-${hotelData.code}`,
        name: hotelData.name,
        chain: { id: null, name: null },
        stars: parseInt(hotelData.categoryCode) || 0,
        address: {
          neighborhood: hotelData.zoneName,
          city: hotelData.destinationName,
          coordinates: {
            lat: parseFloat(hotelData.latitude || 0),
            lng: parseFloat(hotelData.longitude || 0),
          },
        },
        connector: "Hotelbeds",
        images: [],
        facilities: [],
        rooms: rooms.filter((room) => room.rates.length > 0),
      };
    });
}

export const hotelbedsMapper = { hotel: mapAndGroupHotelbeds };