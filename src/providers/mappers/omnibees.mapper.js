import get from "lodash.get";

function mapCurrencyCode(code) {
  if (code === 9) return 'BRL';
  if (code === 16) return 'USD';
  if (code === 978) return 'EUR';
  return null;
}

function mapExtras(serviceData) {
  return {
    servicePricingType: get(serviceData, 'ServicePricingType', null),
    serviceRPH: get(serviceData, 'ServiceRPH', null),
    id: get(serviceData, 'ID', null),
    name: get(serviceData, 'ServiceDescription.Name', ''),
    description: get(serviceData, 'ServiceDescription.Description', ''),
    priceAfterTax: get(serviceData, 'Price[0].AmountAfterTax', null),
  };
}


function generateFlatOfferList(hotelsRawData) {
  return hotelsRawData.reduce((acc, hotelData) => {
    const roomTypesMap = new Map(hotelData.RoomTypes.map(rt => [rt.RoomID, rt]));
    const ratePlansMap = new Map(hotelData.RatePlans.map(rp => [rp.RatePlanID, rp]));

    if (hotelData.RoomRates) {
      for (const roomRate of hotelData.RoomRates) {
        const ratePlan = ratePlansMap.get(roomRate.RatePlanID) || {};
        const roomType = roomTypesMap.get(roomRate.RoomID) || {};
        const cancellationPolicy = get(ratePlan, 'CancelPenalties[0]', {});

        const offer = {
          hotelId: String(get(hotelData, 'BasicPropertyInfo.HotelRef.HotelCode')),
          hotelTitle: get(hotelData, 'BasicPropertyInfo.HotelRef.HotelName'),
          hotelAddress: get(hotelData, 'BasicPropertyInfo.Address.AddressLine'),
          hotelCoordinates: `${get(hotelData, 'BasicPropertyInfo.Position.Latitude')},${get(hotelData, 'BasicPropertyInfo.Position.Longitude')}`,
          hotelStar: get(hotelData, 'BasicPropertyInfo.Award.Rating', null),
          hotelImage: get(hotelData, 'BasicPropertyInfo.ImageURL', null),
          hotelChain: get(hotelData, 'BasicPropertyInfo.HotelRef.ChainName', null),
          hotelZone: get(hotelData, 'BasicPropertyInfo.Address.ZoneCode', null),
          hotelConnector: get(hotelData, 'TPA_Extensions.SupplierCode', 'Omnibees'),
          
          price: get(roomRate, 'Total.AmountBeforeTax', 0),
          currency: mapCurrencyCode(get(roomRate, 'Total.CurrencyCode')),
          total: get(roomRate, 'Total.AmountAfterTax', 0),
          taxes: get(roomRate, 'Total.Taxes', null),
          payment: (get(ratePlan, 'PaymentPolicies.AcceptedPayments') || []).map(p => p.GuaranteeTypeCode).join(', '),
          cancellation: {
            deadline: get(cancellationPolicy, 'DeadLine.OffsetUnitMultiplier', null),
            amount: get(cancellationPolicy, 'AmountPercent.Amount', null),
            percent: get(cancellationPolicy, 'AmountPercent.Percent', null),
            currency: mapCurrencyCode(get(cancellationPolicy, 'AmountPercent.CurrencyCode', null)),
            name: get(cancellationPolicy, 'PenaltyDescription.Name', null),
            from: 'supplier',
            description: get(cancellationPolicy, 'PenaltyDescription.Description', null),
          },
          board: get(ratePlan, 'MealsIncluded.MealPlanCode', null),
          room: get(roomType, 'RoomName', 'N/A'),
          allotment: get(roomRate, 'RatesType.Rates[0].NumberOfUnits', null),
          markup: !!get(ratePlan, 'TPA_Extensions.Markup.Percent'),
          package: !!get(ratePlan, 'TPA_Extensions.Package'),
          amenities: (get(ratePlan, 'RatePlanInclusions') || []).map(inc => inc.ID),
        };
        acc.push(offer);
      }
    }
    return acc;
  }, []);
}

function groupOffersByHotelId(flatOfferList) {
    const hotelsMap = new Map();

    for (const offer of flatOfferList) {
        const { hotelId, hotelTitle, hotelAddress, hotelCoordinates, hotelStar, hotelImage, hotelChain, hotelZone, hotelConnector, amenities, ...offerDetails } = offer;

        if (!hotelsMap.has(hotelId)) {
            hotelsMap.set(hotelId, {
                id: hotelId,
                title: hotelTitle,
                address: hotelAddress,
                coordinates: hotelCoordinates,
                star: hotelStar,
                image: hotelImage,
                chain: hotelChain,
                zone: hotelZone,
                connector: hotelConnector,
                amenities: [],
                offers: [],
            });
        }

        const hotelEntry = hotelsMap.get(hotelId);
        hotelEntry.offers.push(offerDetails);
        
        const existingAmenities = new Set(hotelEntry.amenities);
        amenities.forEach(amenity => existingAmenities.add(amenity));
        hotelEntry.amenities = Array.from(existingAmenities);
    }

    // Retorna a lista de hotéis agrupados
    return Array.from(hotelsMap.values());
}

// --- Função Principal do Mapeador ---
function mapAndGroupOmnibees(hotelsRawData) {
    const flatList = generateFlatOfferList(hotelsRawData);
    const groupedList = groupOffersByHotelId(flatList);
    return groupedList;
}

export const omnibeesMapper = {
    hotel: mapAndGroupOmnibees,
    extras: (services) => services.map(mapExtras),
};