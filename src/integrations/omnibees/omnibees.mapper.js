// import get from "lodash.get";
// import * as parserService from '../../services/parser.service.js'; 
// import * as omnibeesDict from '../omnibees/dictionaries/index.js';
// import * as mappingService from '../../services/mapping.service.js';

// function getHotelTextForAnalysis(hotelData) {
//     const uniqueTexts = new Set();
//     const ratePlans = get(hotelData, 'RatePlans', []);
//     for (const ratePlan of ratePlans) {
//         const inclusions = get(ratePlan, 'RatePlanInclusions') || [];
//         for (const inclusion of inclusions) {
//             const name = get(inclusion, 'RatePlanInclusionDesciption.Name');
//             const description = get(inclusion, 'RatePlanInclusionDesciption.Description');
//             if (name) uniqueTexts.add(name.trim());
//             if (description) uniqueTexts.add(description.trim());
//         }
//     }
//     return Array.from(uniqueTexts).join(' . ');
// }

// function mapAndGroupOmnibees(hotelsRawData) {
//     return {
//         hotel: hotelsRawData.map(hotelData => {
//             const hotelText = getHotelTextForAnalysis(hotelData);
//             const allFacilities = parserService.extractFacilities(hotelText);
//             const facilities = allFacilities.filter(code => parserService.PRIORITY_FACILITIES.includes(code));

//             const roomTypesMap = new Map((get(hotelData, 'RoomTypes') || []).map(rt => [rt.RoomID, rt]));
//             const ratePlansMap = new Map((get(hotelData, 'RatePlans') || []).map(rp => [rp.RatePlanID, rp]));
//             const roomsMap = new Map();

//             for (const roomType of roomTypesMap.values()) {
//                 const roomName = get(roomType, 'RoomName', 'N/A');
//                 const description = get(roomType, 'RoomDescription.Description');
//                 const allAmenityCodes = parserService.extractAmenities(roomName, description);
//                 const amenityCodes = allAmenityCodes.filter(code => parserService.PRIORITY_AMENITIES.includes(code));

//                 roomsMap.set(String(roomType.RoomID), {
//                     type: parserService.extractRoomTypeCode(roomName),
//                     occupancy: parserService.extractOccupancyCode(roomName, get(roomType, 'MaxOccupancy')),
//                     name: roomName,
//                     amenities: amenityCodes,
//                     images: [], // Fonte para imagens de quarto na Omnibees precisa ser confirmada
//                     rates: [],
//                 });
//             }

//             (get(hotelData, 'RoomRates') || []).forEach(roomRate => {
//                 const roomCode = String(roomRate.RoomID);
//                 const room = roomsMap.get(roomCode);
//                 if (!room) return;

//                 const ratePlan = ratePlansMap.get(roomRate.RatePlanID) || {};
//                 const cancellationPolicy = get(ratePlan, 'CancelPenalties[0]', {});
                
//                 const paymentMethods = new Set();
//                 (get(ratePlan, 'PaymentPolicies.AcceptedPayments') || []).forEach(p => {
//                     const standardCode = omnibeesDict.omnibeesPaymentMethodDictionary.get(p.GuaranteeTypeCode);
//                     if (standardCode) paymentMethods.add(standardCode);
//                 });

//                 const taxes = (get(ratePlan, 'TaxPolicies') || []).map(tax => ({
//                     included: true,
//                     description: tax.Name,
//                     total: parseFloat(tax.Value || 0),
//                 }));
//                 const totalTaxes = taxes.reduce((sum, tax) => sum + tax.total, 0);

//                 const commissionValue = get(ratePlan, 'Commission.Percent', 0);
//                 const netPrice = get(roomRate, 'Total.AmountBeforeTax', 0);
//                 const commissionTotal = (netPrice * commissionValue) / 100;

//                 room.rates.push({
//                     id: `R${roomRate.RoomID}-P${ratePlan.RatePlanID}`,
//                     board: omnibeesDict.omnibeesBoardDictionary.get(get(ratePlan, 'MealsIncluded.MealPlanCode')),
//                     commissioned: {
//                         included: true, type: 'percent',
//                         value: commissionValue, total: commissionTotal
//                     },
//                     taxes: taxes,
//                     price: {
//                         net: netPrice,
//                         total: get(roomRate, 'Total.AmountAfterTax', 0),
//                         markup: null,
//                         taxes: totalTaxes,
//                         commission: commissionTotal,
//                         currency: omnibeesDict.omnibeesCurrencyDictionary.get(get(roomRate, 'Total.CurrencyCode')),
//                     },
//                     payment: parserService.getPriorityPaymentMethod(paymentMethods),
//                     cancellation: {
//                         amount: get(cancellationPolicy, 'AmountPercent.Amount'),
//                         from: get(cancellationPolicy, 'Start'),
//                         deadline: get(cancellationPolicy, 'DeadLine.AbsoluteDeadline')
//                     },
//                     allotment: get(roomRate, 'RatesType.Rates[0].NumberOfUnits'),
//                 });
//             });

//             const basicInfo = hotelData.BasicPropertyInfo;
//             const standardCountryCode = omnibeesDict.omnibeesCountryDictionary.get(get(basicInfo, 'Address.CountryCode'));

//             return {
//                 id: `HT${get(basicInfo, 'HotelRef.HotelCode')}`,
//                 name: get(basicInfo, 'HotelRef.HotelName'),
//                 chain: { id: String(get(basicInfo, 'HotelRef.ChainCode')), name: get(basicInfo, 'HotelRef.ChainName') },
//                 stars: get(basicInfo, 'Award.Rating', 0),
//                 address: {
//                     street: get(basicInfo, 'Address.AddressLine'),
//                     city: get(basicInfo, 'Address.CityName'),
//                     country: mappingService.getCountryName(standardCountryCode) || get(basicInfo, 'Address.CountryName'),
//                     zipcode: get(basicInfo, 'Address.PostalCode'),
//                     coordinates: { lat: parseFloat(get(basicInfo, 'Position.Latitude', 0)), lng: parseFloat(get(basicInfo, 'Position.Longitude', 0)) }
//                 },
//                 connector: "omnibees",
//                 images: [get(basicInfo, 'ImageURL')].filter(Boolean),
//                 facilities: facilities,
//                 rooms: Array.from(roomsMap.values()).filter(room => room.rates.length > 0),
//             };
//         })
//     };
// }

// export const omnibeesMapper = {
//     hotel: mapAndGroupOmnibees
// };

import get from "lodash.get";
import * as parserService from '../../services/parser.service.js'; 
import * as omnibeesDict from '../omnibees/dictionaries/index.js';
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

function mapAndGroupOmnibees(hotelsRawData) {
    return {
        hotel: hotelsRawData.map(hotelData => {
            const hotelText = getHotelTextForAnalysis(hotelData);
            const allFacilities = parserService.extractFacilities(hotelText);
            const facilities = allFacilities.filter(code => parserService.PRIORITY_FACILITIES.includes(code));

            const roomTypesMap = new Map((get(hotelData, 'RoomTypes') || []).map(rt => [rt.RoomID, rt]));
            const ratePlansMap = new Map((get(hotelData, 'RatePlans') || []).map(rp => [rp.RatePlanID, rp]));
            const roomsMap = new Map();

            for (const roomType of roomTypesMap.values()) {
                const roomName = get(roomType, 'RoomName', 'N/A');
                const description = get(roomType, 'RoomDescription.Description');
                const allAmenityCodes = parserService.extractAmenities(roomName, description);
                const amenityCodes = allAmenityCodes.filter(code => parserService.PRIORITY_AMENITIES.includes(code));

                roomsMap.set(String(roomType.RoomID), {
                    type: parserService.extractRoomTypeCode(roomName),
                    occupancy: parserService.extractOccupancyCode(roomName, get(roomType, 'MaxOccupancy')),
                    name: roomName,
                    amenities: amenityCodes,
                    images: [], // Fonte para imagens de quarto na Omnibees precisa ser confirmada
                    rates: [],
                });
            }

            (get(hotelData, 'RoomRates') || []).forEach(roomRate => {
                const roomCode = String(roomRate.RoomID);
                const room = roomsMap.get(roomCode);
                if (!room) return;

                const ratePlan = ratePlansMap.get(roomRate.RatePlanID) || {};
                const cancellationPolicy = get(ratePlan, 'CancelPenalties[0]', {});
                
                // --- INÍCIO DA LÓGICA DE MAPEAMENTO DE RATES ATUALIZADA ---

                const totalAmount = get(roomRate, 'Total.AmountAfterTax', 0);
                const netAmount = get(roomRate, 'Total.AmountBeforeTax', 0);
                const taxesAmount = get(ratePlan, 'TaxPolicies', [])?.reduce((sum, tax) => sum + parseFloat(tax.Value || 0), 0);
                
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
                        included: get(ratePlan, 'Commission.Commissionable', false),
                        type: 'percent',
                        value: get(ratePlan, 'Commission.Percent', 0),
                        total: (netAmount * get(ratePlan, 'Commission.Percent', 0)) / 100,
                    },
                    resume: {
                        net: netAmount,
                        markup: null,
                        commission: (netAmount * get(ratePlan, 'Commission.Percent', 0)) / 100,
                        commissioned: null, // Pode ser o mesmo valor acima, dependendo da regra
                        fee: taxesAmount,
                        total: totalAmount,
                    }
                };

                // 2. Mapeia o novo array 'fees'
                const fees = (get(ratePlan, 'TaxPolicies') || []).map(tax => ({
                    included: true, // Omnibees geralmente inclui no total
                    currency: omnibeesDict.omnibeesCurrencyDictionary.get(get(roomRate, 'Total.CurrencyCode')),
                    name: tax.Name,
                    type: 'percent', // Assumindo percentual
                    value: parseFloat(tax.Value || 0),
                    total: (netAmount * parseFloat(tax.Value || 0)) / 100, // Cálculo do total da taxa
                }));

                // 3. Constrói o objeto de rate final com a nova estrutura
                const newRate = {
                    id: `R${roomRate.RoomID}-P${ratePlan.RatePlanID}`,
                    board: omnibeesDict.omnibeesBoardDictionary.get(get(ratePlan, 'MealsIncluded.MealPlanCode')),
                    pricing: pricing,
                    payment: parserService.getPriorityPaymentMethod(new Set(
                        (get(ratePlan, 'PaymentPolicies.AcceptedPayments') || []).map(p => omnibeesDict.omnibeesPaymentMethodDictionary.get(p.GuaranteeTypeCode)).filter(Boolean)
                    )),
                    fees: fees,
                    cancellation: {
                        amount: get(cancellationPolicy, 'AmountPercent.Amount'),
                        from: get(cancellationPolicy, 'Start'),
                        deadline: get(cancellationPolicy, 'DeadLine.AbsoluteDeadline')
                    },
                    allotment: get(roomRate, 'RatesType.Rates[0].NumberOfUnits'),
                };

                room.rates.push(newRate);

                // --- FIM DA LÓGICA DE MAPEAMENTO DE RATES ATUALIZADA ---
            });

            const basicInfo = hotelData.BasicPropertyInfo;
            const standardCountryCode = omnibeesDict.omnibeesCountryDictionary.get(get(basicInfo, 'Address.CountryCode'));

            return {
                id: `HT${get(basicInfo, 'HotelRef.HotelCode')}`,
                name: get(basicInfo, 'HotelRef.HotelName'),
                chain: { id: String(get(basicInfo, 'HotelRef.ChainCode')), name: get(basicInfo, 'HotelRef.ChainName') },
                stars: get(basicInfo, 'Award.Rating', 0),
                address: {
                    street: get(basicInfo, 'Address.AddressLine'),
                    city: get(basicInfo, 'Address.CityName'),
                    country: mappingService.getCountryName(standardCountryCode) || get(basicInfo, 'Address.CountryName'),
                    zipcode: get(basicInfo, 'Address.PostalCode'),
                    coordinates: { lat: parseFloat(get(basicInfo, 'Position.Latitude', 0)), lng: parseFloat(get(basicInfo, 'Position.Longitude', 0)) }
                },
                connector: "omnibees",
                images: [get(basicInfo, 'ImageURL')].filter(Boolean),
                facilities: facilities,
                rooms: Array.from(roomsMap.values()).filter(room => room.rates.length > 0),
            };
        })
    };
}

export const omnibeesMapper = {
    hotel: mapAndGroupOmnibees
};
