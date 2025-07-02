import get from "lodash.get";
import * as parserService from '../../services/parser.service.js';
import { hotelbedsPaymentTypeDictionary } from '../hotelbeds/dictionaries/payment-types.dictionaries.js';

function mapAndGroupHotelbeds(hotelsRawData) {
    return {
        hotel: hotelsRawData.map(hotelData => {
            const rooms = hotelData.rooms.map(roomData => {
                const rates = roomData.rates.map(rateData => {
                    const mainCancellationPolicy = get(rateData, 'cancellationPolicies[0]', {});
                    const paymentCode = hotelbedsPaymentTypeDictionary.get(rateData.paymentType);

                    return {
                        id: rateData.rateKey,
                        board: rateData.boardCode,
                        commissioned: null, // Não disponível
                        taxes: [], // Não disponível
                        price: {
                            net: parseFloat(rateData.net || 0),
                            total: parseFloat(rateData.net || 0),
                            markup: null,
                            taxes: null,
                            commission: null,
                            currency: hotelData.currency,
                        },
                        payment: paymentCode || null, // Hotelbeds geralmente informa um só
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
                    occupancy: parserService.extractOccupancyCode(roomData.name, get(roomData, 'adults', 0) + get(roomData, 'children', 0)),
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
                        lng: parseFloat(hotelData.longitude || 0)
                    }
                },
                connector: "Hotelbeds",
                images: [],
                facilities: [],
                rooms: rooms.filter(room => room.rates.length > 0),
            };
        })
    };
}

export const hotelbedsMapper = { hotel: mapAndGroupHotelbeds };