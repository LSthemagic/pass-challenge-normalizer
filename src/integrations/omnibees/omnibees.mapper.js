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

// Função principal de mapeamento
function mapAndGroupOmnibees(hotelsRawData) {
    // A função já retorna um array de hotéis, que é o correto.
    return hotelsRawData.map(hotelData => {
        // Lógica de extração de facilities e preparação de mapas (sem alterações)
        const hotelText = getHotelTextForAnalysis(hotelData);
        const allFacilities = parserService.extractFacilities(hotelText);
        const facilities = allFacilities.filter(code => parserService.PRIORITY_FACILITIES.includes(code));

        const roomTypesMap = new Map((get(hotelData, 'RoomTypes') || []).map(rt => [rt.RoomID, rt]));
        const ratePlansMap = new Map((get(hotelData, 'RatePlans') || []).map(rp => [rp.RatePlanID, rp]));
        const roomsMap = new Map();

        // Lógica de mapeamento inicial de quartos (sem alterações)
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
                images: [],
                rates: [],
            });
        }

        // Itera sobre as tarifas para preencher os quartos
        (get(hotelData, 'RoomRates') || []).forEach(roomRate => {
            const roomCode = String(roomRate.RoomID);
            const room = roomsMap.get(roomCode);
            if (!room) return;

            const ratePlan = ratePlansMap.get(roomRate.RatePlanID) || {};
            const cancellationPolicy = get(ratePlan, 'CancelPenalties[0]', {});
            
            // --- INÍCIO DA LÓGICA DE MAPEAMENTO DE RATES ATUALIZADA ---

            // Variáveis auxiliares para facilitar a leitura e o acesso aos dados
            const netAmount = get(roomRate, 'Total.AmountBeforeTax', 0);
            const totalAmount = get(roomRate, 'Total.AmountAfterTax', 0);
            const commissionPercent = get(ratePlan, 'Commission.Percent', 0);
            const commissionTotal = (netAmount * commissionPercent) / 100;
            const markupPercent = get(ratePlan, 'TPA_Extensions.Markup.Percent', 0);
            const markupTotal = (netAmount * markupPercent) / 100;
            const taxesTotal = get(roomRate, 'Total.Taxes', [])?.reduce((sum, tax) => sum + parseFloat(tax.Amount || 0), 0);

            // 1. Mapeia o novo objeto 'price'
            const price = {
                net: netAmount,
                total: totalAmount,
                markup: markupTotal,
                taxes: taxesTotal,
                commission: commissionTotal,
                currency: omnibeesDict.omnibeesCurrencyDictionary.get(get(roomRate, 'Total.CurrencyCode')),
            };

            // 2. Mapeia o novo objeto 'commissioned'
            const commissioned = {
                included: get(ratePlan, 'Commission.Commissionable', false),
                type: 'percent',
                value: commissionPercent,
                total: commissionTotal,
            };

            // 3. Mapeia o novo array 'taxes' (anteriormente 'fees')
            const taxes = (get(ratePlan, 'TaxPolicies') || []).map(tax => ({
                included: true, // Omnibees geralmente inclui no total
                description: tax.Name,
                total: get(tax, 'IsValuePercentage', false) ? (netAmount * parseFloat(tax.Value || 0)) / 100 : parseFloat(tax.Value || 0),
            }));

            // 4. Constrói o objeto de rate final com a nova estrutura simplificada
            const newRate = {
                id: `R${roomRate.RoomID}-P${ratePlan.RatePlanID}`,
                board: omnibeesDict.omnibeesBoardDictionary.get(get(ratePlan, 'MealsIncluded.MealPlanCode')),
                commissioned: commissioned,
                taxes: taxes,
                price: price,
                payment: parserService.getPriorityPaymentMethod(new Set(
                    (get(ratePlan, 'PaymentPolicies.AcceptedPayments') || []).map(p => omnibeesDict.omnibeesPaymentMethodDictionary.get(p.GuaranteeTypeCode)).filter(Boolean)
                )),
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

        // Lógica final de construção do objeto do hotel (sem alterações)
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
    });
}

// A exportação permanece a mesma para compatibilidade com o orquestrador
export const omnibeesMapper = {
    hotel: mapAndGroupOmnibees
};