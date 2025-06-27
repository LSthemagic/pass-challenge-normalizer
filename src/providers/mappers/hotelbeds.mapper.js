import get from "lodash.get";
import * as parserService from '../../services/parser.service.js';
import { hotelbedsPaymentTypeDictionary } from '../hotelbeds/dictionaries/payment-types.dictionaries.js';


// Função síncrona, pois usa apenas parsers locais.
function mapAndGroupHotelbeds(hotelsRawData) {
    const processedHotels = hotelsRawData.map(hotelData => {
        
        const rooms = hotelData.rooms.map(roomData => {
            const rates = roomData.rates.map(rateData => {
                // Pega a primeira política de cancelamento como principal
                const mainCancellationPolicy = get(rateData, 'cancellationPolicies[0]', {});
                
                // Mapeia o tipo de pagamento
                const paymentCode = hotelbedsPaymentTypeDictionary.get(rateData.paymentType);

                return {
                    rate_id: rateData.rateKey,
                    board: rateData.boardCode, // Hotelbeds já envia no nosso formato padrão
                    price: {
                        net: parseFloat(rateData.net || 0),
                        total: parseFloat(rateData.net || 0), // Usando 'net' como 'total' pois é o preço final ao consumidor nesse caso
                        markup: null, // Não disponível
                        commission: null, // Não disponível
                        currency: hotelData.currency,
                    },
                    payment: paymentCode ? [paymentCode] : [],
                    card_flags: [], // Não disponível nesta resposta da API
                    cancellation: {
                        amount: parseFloat(mainCancellationPolicy.amount || 0),
                        from: mainCancellationPolicy.from || null,
                        deadline: null, // Não disponível
                    },
                    allotment: rateData.allotment,
                };
            });

            const roomName = roomData.name;
            // O Hotelbeds não fornece um 'maxOccupancy' numérico, então passamos nulo para o parser de ocupação.
            const standardTypeCode = parserService.extractRoomTypeCode(roomName);
            const standardOccupancyCode = parserService.extractOccupancyCode(roomName, null);

            return {
                type: standardTypeCode,
                occupancy: standardOccupancyCode,
                name: roomName,
                amenities: [], // Não disponível nesta resposta
                rates: rates,
            };
        });

        return {
            id: `HTB-${hotelData.code}`,
            name: hotelData.name,
            chain: { id: null, name: null }, // Não disponível nesta resposta
            stars: parseInt(hotelData.categoryCode) || 0,
            address: {
                street: null,
                neighborhood: hotelData.zoneName,
                city: hotelData.destinationName,
                state: null,
                country: null,
                zipcode: null,
                coordinates: {
                    lat: parseFloat(hotelData.latitude || 0),
                    lng: parseFloat(hotelData.longitude || 0)
                }
            },
            connector: "Hotelbeds",
            images: [], // Não disponível nesta resposta
            facilities: [], // Não disponível nesta resposta
            rooms: rooms.filter(room => room.rates.length > 0),
        };
    });

    return { hotel: processedHotels };
}

export const hotelbedsMapper = {
    hotel: mapAndGroupHotelbeds
};