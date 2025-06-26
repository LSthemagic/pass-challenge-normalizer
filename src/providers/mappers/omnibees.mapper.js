import get from "lodash.get";
import { extractAmenities } from "../../strategies/amenity-extractor.agent.js";
import { extractRoomTypeCode } from "../../strategies/room-type-extractor.agent.js";
import { extractFacilities } from "../../strategies/facility-extractor.agent.js";
import { extractOccupancyCode } from "../../strategies/occupancy-extractor.agent.js";
import { omnibeesBoardDictionary } from "../omnibees/dictionaries/board.dictionary.js";
import { omnibeesCurrencyDictionary } from "../omnibees/dictionaries/currency.dictionary.js";
import { omnibeesPaymentMethodDictionary } from "../omnibees/dictionaries/payment-methods.dictionary.js";
import { omnibeesCountryDictionary } from "../omnibees/dictionaries/country.dictionary.js";
import * as mappingService from '../../services/mapping.service.js';

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

async function mapAndGroupOmnibees(hotelsRawData) {
    const processedHotels = await Promise.all(
        hotelsRawData.map(async (hotelData) => {
            const hotelText = getHotelTextForAnalysis(hotelData);
            const facilities = await extractFacilities(hotelText);

            const roomTypesMap = new Map((hotelData.RoomTypes || []).map(rt => [rt.RoomID, rt]));
            const ratePlansMap = new Map((hotelData.RatePlans || []).map(rp => [rp.RatePlanID, rp]));
            const roomsMap = new Map();

            for (const roomType of roomTypesMap.values()) {
                const roomCode = String(roomType.RoomID);
                const roomName = get(roomType, 'RoomName', 'N/A');
                const maxOccupancy = get(roomType, 'MaxOccupancy');
                const description = get(roomType, 'RoomDescription.Description', null);
                // console.log(`Description ${description}`)
                const [amenityCodes, standardTypeCode, standardOccupancyCode] = await Promise.all([
                    extractAmenities(roomName, description),
                    extractRoomTypeCode(roomName),
                    extractOccupancyCode(roomName, maxOccupancy)
                ]);
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
                            rate_id: `R${roomRate.RoomID}-P${roomRate.RatePlanID}`,
                            board: omnibeesBoardDictionary.get(providerBoardCode) || null,
                            price: {
                                net: get(roomRate, 'Total.AmountBeforeTax', 0),
                                total: get(roomRate, 'Total.AmountAfterTax', 0),
                                markup: get(ratePlan, 'TPA_Extensions.Markup.Percent', null),
                                commission: get(ratePlan, 'Commission.Percent', null),
                                currency: omnibeesCurrencyDictionary.get(get(ratePlan, 'CurrencyCode', null)),
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
                    neighborhood: null, city: get(basicInfo, 'Address.CityName'),
                    state: get(basicInfo, 'Address.StateProv'), country: get(basicInfo, 'Address.CountryName'),
                    // country: mappingService.getCountryName(standardCountryCode),
                    country: standardCountryCode,
                    zipcode: get(basicInfo, 'Address.PostalCode'),
                    coordinates: { lat: parseFloat(get(basicInfo, 'Position.Latitude', 0)), lng: parseFloat(get(basicInfo, 'Position.Longitude', 0)) }
                },
                connector: "Omnibees",
                images: [get(basicInfo, 'ImageURL')].filter(Boolean),
                facilities: facilities,
                rooms: Array.from(roomsMap.values()).filter(room => room.rates.length > 0),
            };
        })
    );
    return { hotel: processedHotels };
}

export const omnibeesMapper = {
    hotel: mapAndGroupOmnibees
};