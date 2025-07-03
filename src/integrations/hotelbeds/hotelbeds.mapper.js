import get from "lodash.get";
import * as parserService from "../../services/parser.service.js";
import * as mappingService from '../../services/mapping.service.js';
import { hotelbedsPaymentTypeDictionary } from "../hotelbeds/dictionaries/payment-types.dictionaries.js";

function mapAndGroupHotelbeds(hotelsRawData) {
  // return {
  console.log(hotelsRawData)
    return hotelsRawData?.map((hotelData) => {
      const rooms = hotelData.rooms.map((roomData) => {
        const rates = roomData.rates.map((rateData) => {
          const mainCancellationPolicy = get(
            rateData,
            "cancellationPolicies[0]",
            {}
          );
          const paymentCode = hotelbedsPaymentTypeDictionary.get(
            rateData.paymentType
          );

          // Mapeamento do objeto pricing
          const netAmount = parseFloat(rateData.net || 0);
          const totalAmount = netAmount; // No Hotelbeds, 'net' parece ser o total se não houver taxas/markups explícitos

          const pricing = {
            markup: {
              included: false,
              current: null,
              applied: null,
              total: null,
            },
            commission: {
              included: false,
              current: null,
              applied: null,
              total: null,
            },
            commissioned: {
              included: false,
              type: "percent",
              value: 0,
              total: 0,
            },
            resume: {
              net: netAmount,
              markup: null,
              commission: 0,
              commissioned: null,
              fee: 0, // Hotelbeds não fornece taxas detalhadas no exemplo
              total: totalAmount,
            },
          };

          // Mapeamento do array fees
          const fees = []; // Hotelbeds não fornece taxas detalhadas no exemplo

          return {
            id: rateData.rateKey,
            board: rateData.boardCode,
            pricing: pricing,
            payment: paymentCode || null,
            fees: fees,
            cancellation: {
              amount: parseFloat(mainCancellationPolicy.amount || 0),
              from: mainCancellationPolicy.from || null,
              deadline: null,
            },
            allotment: rateData.allotment,
          };
        });

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
  // };
  // const filterData = mappingService.generateFilterObject(normalizedHotels);
  // return {
  //   hotel: normalizedHotels,
  //   filter: filterData,
  // }
}

export const hotelbedsMapper = { hotel: mapAndGroupHotelbeds };