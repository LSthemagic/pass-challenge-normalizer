import get from "lodash.get";
// 1. IMPORTA O NOVO SERVIÇO DE PARSER LOCAL
import * as parserService from '../../services/parser.service.js'; 
import { omnibeesBoardDictionary } from "../omnibees/dictionaries/board.dictionary.js";
import { omnibeesCurrencyDictionary } from "../omnibees/dictionaries/currency.dictionary.js";
import { omnibeesPaymentMethodDictionary } from "../omnibees/dictionaries/payment-methods.dictionary.js";
import { omnibeesCountryDictionary } from "../omnibees/dictionaries/country.dictionary.js";
import { getCountryName } from '../../services/mapping.service.js';

function getHotelTextForAnalysis(hotelData) {
    const uniqueTexts = new Set();
    const ratePlans = get(hotelData, 'RatePlans', []);
    for (const ratePlan of ratePlans) {
        const inclusions = get(ratePlan, 'RatePlanInclusions') || [];
        for (const inclusion of inclusions) {
            const name = get(inclusion, 'RatePlanInclusionDesciption.Name');
            const description = get(inclusion, 'RatePlanInclusionDesciption.Description');
            if (name) uniqueTexts.add(name.trim());
            if (description) uniqueTexts.add(description.trim());
        }
    }
    return Array.from(uniqueTexts).join(' . ');
}

// 2. A FUNÇÃO AGORA É SÍNCRONA (NÃO MAIS 'async')
function mapAndGroupOmnibees(hotelsRawData) {
    const processedHotels = hotelsRawData.map((hotelData) => {
        const hotelText = getHotelTextForAnalysis(hotelData);
        // Chamada direta ao parser, sem 'await'
        const facilities = parserService.extractFacilities(hotelText);

        const roomTypesMap = new Map((hotelData.RoomTypes || []).map(rt => [rt.RoomID, rt]));
        const ratePlansMap = new Map((hotelData.RatePlans || []).map(rp => [rp.RatePlanID, rp]));
        const roomsMap = new Map();

        for (const roomType of roomTypesMap.values()) {
            const roomCode = String(roomType.RoomID);
            const roomName = get(roomType, 'RoomName', 'N/A');
            const maxOccupancy = get(roomType, 'MaxOccupancy');
            const description = get(roomType, 'RoomDescription.Description');
            
            // 3. CHAMADAS DIRETAS AO PARSER, SEM 'await' OU 'Promise.all'
            const amenityCodes = parserService.extractAmenities(roomName, description);
            const standardTypeCode = parserService.extractRoomTypeCode(roomName);
            const standardOccupancyCode = parserService.extractOccupancyCode(roomName, maxOccupancy);
            
            roomsMap.set(roomCode, {
                type: standardTypeCode,
                occupancy: standardOccupancyCode,
                name: roomName,
                amenities: amenityCodes,
                rates: [],
            });
        }

        if (hotelData.RoomRates) {
            for (const roomRate of hotelData.RoomRates) {
                const roomCode = String(roomRate.RoomID);
                if (roomsMap.has(roomCode)) {
                    const ratePlan = ratePlansMap.get(roomRate.RatePlanID) || {};
                    const cancellationPolicy = get(ratePlan, 'CancelPenalties[0]', {});
                    const providerBoardCode = get(ratePlan, 'MealsIncluded.MealPlanCode', null);
                    
                    const acceptedPaymentsRaw = get(ratePlan, 'PaymentPolicies.AcceptedPayments', []);
                    const paymentMethods = new Set();
                    for (const payment of acceptedPaymentsRaw) {
                        const standardCode = omnibeesPaymentMethodDictionary.get(payment.GuaranteeTypeCode);
                        if (standardCode) {
                            paymentMethods.add(standardCode);
                        }
                    }
                    
                    roomsMap.get(roomCode).rates.push({
                        rate_id: `R${roomRate.RoomID}-P${ratePlan.RatePlanID}`,
                        board: omnibeesBoardDictionary.get(providerBoardCode) || null,
                        price: {
                            net: get(roomRate, 'Total.AmountBeforeTax', 0),
                            total: get(roomRate, 'Total.AmountAfterTax', 0),
                            markup: get(ratePlan, 'TPA_Extensions.Markup.Percent', null),
                            commission: get(ratePlan, 'Commission.Percent', null),
                            // 4. CORREÇÃO: Moeda vem do objeto 'roomRate.Total', não do 'ratePlan'.
                            currency: omnibeesCurrencyDictionary.get(get(roomRate, 'Total.CurrencyCode')),
                        },
                        payment: Array.from(paymentMethods),
                        cancellation: {
                            amount: get(cancellationPolicy, 'AmountPercent.Amount', null),
                            from: get(cancellationPolicy, 'Start', null),
                            deadline: get(cancellationPolicy, 'DeadLine.AbsoluteDeadline', null)
                        },
                        allotment: get(roomRate, 'RatesType.Rates[0].NumberOfUnits', null),
                    });
                }
            }
        }
        
        const basicInfo = hotelData.BasicPropertyInfo;
        const providerCountryCode = get(basicInfo, 'Address.CountryCode');
        const standardCountryCode = omnibeesCountryDictionary.get(providerCountryCode);

        return {
            id: `HT${get(basicInfo, 'HotelRef.HotelCode')}`,
            name: get(basicInfo, 'HotelRef.HotelName'),
            chain: { id: String(get(basicInfo, 'HotelRef.ChainCode')), name: get(basicInfo, 'HotelRef.ChainName') },
            stars: get(basicInfo, 'Award.Rating', 0),
            address: {
                street: get(basicInfo, 'Address.AddressLine'),
                neighborhood: null,
                city: get(basicInfo, 'Address.CityName'),
                state: get(basicInfo, 'Address.StateProv'),
                country: getCountryName(standardCountryCode) || get(basicInfo, 'Address.CountryName'),
                zipcode: get(basicInfo, 'Address.PostalCode'),
                coordinates: { lat: parseFloat(get(basicInfo, 'Position.Latitude', 0)), lng: parseFloat(get(basicInfo, 'Position.Longitude', 0)) }
            },
            connector: "Omnibees",
            images: [get(basicInfo, 'ImageURL')].filter(Boolean),
            facilities: facilities,
            rooms: Array.from(roomsMap.values()).filter(room => room.rates.length > 0),
        };
    });

    return { hotel: processedHotels };
}

export const omnibeesMapper = {
    hotel: mapAndGroupOmnibees
};