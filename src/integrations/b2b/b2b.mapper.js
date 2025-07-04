import get from "lodash.get";
import { boardDictionary } from "./dictionaries/board.dictionary.js";
import { ratingsDictionary } from "./dictionaries/ratings.dictionary.js";
import * as parserService from "../../services/parser.service.js";

/**
 * Mapeia os dados da B2B.
 * @param {Array|Object} hotelDataArray - Objeto OTA_HotelAvailRS extraído pelo orquestrador.
 * @param {string} checkIn - A data de check-in para cálculo do cancelamento.
 * @returns {Array} Um array de hotéis mapeados.
 */
function mapAndGroupB2B(hotelDataArray, checkIn) {
  // O orquestrador nos envia o objeto OTA_HotelAvailRS diretamente
  const b2bResponseObject = Array.isArray(hotelDataArray) ? hotelDataArray[0] : hotelDataArray;

  // console.log("[Mapper B2B] Dados recebidos:", JSON.stringify(b2bResponseObject, null, 2));

  if (!b2bResponseObject) {
    console.log("[Mapper B2B] Objeto de resposta principal não encontrado.");
    return [];
  }

  // Verifica se há warnings que indicam problema
  const warnings = get(b2bResponseObject, "ota:Warnings.ota:Warning", []);
  if (warnings.length > 0) {
    console.log("[Mapper B2B] Warnings encontrados:", warnings);
  }

  // Extrai dados de hotéis e quartos
  const hotelStays = get(b2bResponseObject, "ota:HotelStays.ota:HotelStay", []);
  const roomStays = get(b2bResponseObject, "ota:RoomStays.ota:RoomStay", []);

  // console.log("[Mapper B2B] HotelStays encontrados:", hotelStays);
  // console.log("[Mapper B2B] RoomStays encontrados:", roomStays);

  // Normaliza para arrays
  const hotelStaysArray = Array.isArray(hotelStays) ? hotelStays : [hotelStays];
  const roomStaysArray = Array.isArray(roomStays) ? roomStays : [roomStays];

  // Validações
  if (!hotelStaysArray.length || !hotelStaysArray[0]) {
    console.log("[Mapper B2B] Nenhum hotel encontrado na resposta (HotelStays está vazio).");
    return [];
  }
  if (!roomStaysArray.length || !roomStaysArray[0]) {
    console.log("[Mapper B2B] Nenhum dado de quarto encontrado na resposta (RoomStays está vazio).");
    return [];
  }

  const roomStay = roomStaysArray[0];

  // Mapeia tipos de quartos
  const roomTypesMap = new Map();
  const roomTypes = get(roomStay, "ota:RoomTypes.ota:RoomType", []);
  const roomTypesArray = Array.isArray(roomTypes) ? roomTypes : [roomTypes];
  
  roomTypesArray.forEach(rt => {
    const roomTypeCode = get(rt, "RoomTypeCode");
    roomTypesMap.set(roomTypeCode, {
      name: get(rt, "ota:RoomDescription.ota:Text", ""),
      maxOccupancy: get(rt, 'ota:Occupancy.MaxOccupancy', 0)
    });
  });

  // Mapeia planos de tarifas
  const ratePlansMap = new Map();
  const ratePlans = get(roomStay, "ota:RatePlans.ota:RatePlan", []);
  const ratePlansArray = Array.isArray(ratePlans) ? ratePlans : [ratePlans];
  
  ratePlansArray.forEach(rp => {
    const ratePlanCode = get(rp, "RatePlanCode");
    const mealPlanCode = get(rp, "ota:MealsIncluded.MealPlanCodes");
    ratePlansMap.set(ratePlanCode, {
      board: boardDictionary.get(mealPlanCode) || "RO",
    });
  });

  // Extrai imagens
  const images = get(roomStay, "ota:TPA_Extensions.ns2:ImageItems.ns2:ImageItem", []);
  const imagesArray = Array.isArray(images) ? images : [images];
  const imageUrls = imagesArray
    .map(img => decodeURIComponent(get(img, "ns2:ImageFormat.ns2:URL", "")))
    .filter(Boolean);

  // Dados de cancelamento
  const cancelPenaltyRaw = get(roomStay, "ota:CancelPenalties.ota:CancelPenalty.ota:Deadline");

  // Mapeia cada hotel
  return hotelStaysArray.map(hotelData => {
    const basicInfo = get(hotelData, "ota:BasicPropertyInfo");
    const hotelCode = get(basicInfo, "HotelCode");
    const addressInfo = get(basicInfo, "ota:Address");
    const addressLines = get(addressInfo, "ota:AddressLine", []);
    const addressLinesArray = Array.isArray(addressLines) ? addressLines : [addressLines];
    const ratingText = get(basicInfo, 'ota:Award.Rating');

    // Processa tarifas de quartos
    const groupedRooms = {};
    const roomRates = get(roomStay, "ota:RoomRates.ota:RoomRate", []);
    const roomRatesArray = Array.isArray(roomRates) ? roomRates : [roomRates];

    roomRatesArray.forEach(rr => {
      const roomTypeCode = get(rr, "RoomTypeCode");
      const ratePlanCode = get(rr, "RatePlanCode");
      const roomDetails = roomTypesMap.get(roomTypeCode);
      const ratePlanDetails = ratePlansMap.get(ratePlanCode);
      const rateInfo = get(rr, "ota:Rates.ota:Rate");

      if (!rateInfo || !ratePlanDetails || !roomDetails) return;

      const netAmount = parseFloat(get(rateInfo, "ota:Base.AmountBeforeTax", 0));
      
      // Calcula cancelamento
      let cancellationFrom = null;
      if (checkIn && cancelPenaltyRaw && cancelPenaltyRaw.OffsetUnitMultiplier) {
        const checkInDate = new Date(`${checkIn}T23:59:59`);
        checkInDate.setHours(checkInDate.getHours() - parseInt(cancelPenaltyRaw.OffsetUnitMultiplier, 10));
        cancellationFrom = checkInDate.toISOString();
      }

      const rate = {
        id: `${ratePlanCode}-${roomTypeCode}`,
        board: ratePlanDetails.board,
        commissioned: { included: false, type: "percent", value: 0, total: 0 },
        taxes: [],
        price: {
          net: netAmount,
          total: parseFloat(get(rateInfo, "ota:Total.AmountAfterTax", 0)),
          markup: null,
          taxes: 0,
          commission: 0,
          currency: get(rateInfo, "ota:Base.CurrencyCode"),
        },
        payment: "credit-card",
        cancellation: {
          amount: netAmount,
          from: cancellationFrom,
          deadline: null,
        },
        allotment: 1,
      };

      if (!groupedRooms[roomTypeCode]) {
        groupedRooms[roomTypeCode] = {
          type: parserService.extractRoomTypeCode(roomDetails.name),
          occupancy: parserService.extractOccupancyCode(roomDetails.name, roomDetails.maxOccupancy),
          name: roomDetails.name,
          amenities: [],
          images: [],
          rates: [],
        };
      }
      groupedRooms[roomTypeCode].rates.push(rate);
    });

    return {
      id: `B2B-${hotelCode}`,
      name: get(basicInfo, "HotelName"),
      chain: { id: get(basicInfo, "ChainCode"), name: null },
      stars: ratingsDictionary.get(ratingText) || 0,
      address: {
        street: addressLinesArray[0] || null,
        neighborhood: addressLinesArray[1] || null,
        city: get(addressInfo, "ota:CityName"),
        state: get(addressInfo, "ota:StateProv.StateCode"),
        country: get(addressInfo, "ota:CountryName"),
        zipcode: get(addressInfo, "ota:PostalCode"),
        coordinates: {
          lat: parseFloat(get(basicInfo, "ota:Position.Latitude", 0)),
          lng: parseFloat(get(basicInfo, "ota:Position.Longitude", 0)),
        },
      },
      connector: "B2B Reservas",
      images: imageUrls,
      facilities: [],
      rooms: Object.values(groupedRooms).filter(room => room.rates.length > 0),
    };
  });
}

export const b2bMapper = { hotel: mapAndGroupB2B };