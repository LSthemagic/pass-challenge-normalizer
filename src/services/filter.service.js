export function generateFilterObject(normalizedHotels) {
    // A estrutura inicial do filtro, agora incluindo 'connector'.
    const filter = {
        currency: { code: "BRL", min: Infinity, max: -Infinity },
        payment: {},
        cancellation: { free: 0 },
        stars: {},
        board: {},
        chain: {},
        neighborhoods: {},
        category: {},
        facilities: {},
        connector: {}, // Adicionado o filtro de conector
    };

    const allPrices = [];

    if (!normalizedHotels || normalizedHotels.length === 0) {
        filter.currency.min = 0;
        filter.currency.max = 0;
        return filter;
    }

    for (const hotel of normalizedHotels) {
        if (!hotel || typeof hotel !== 'object') continue;

        // Contagem de estrelas
        if (hotel.stars) {
            filter.stars[hotel.stars] = (filter.stars[hotel.stars] || 0) + 1;
        }

        // Contagem de redes
        if (hotel.chain && hotel.chain.name) {
            filter.chain[hotel.chain.name] = (filter.chain[hotel.chain.name] || 0) + 1;
        }
        
        // **NOVO: Contagem de conectores**
        if (hotel.connector) {
            filter.connector[hotel.connector] = (filter.connector[hotel.connector] || 0) + 1;
        }

        // Contagem de bairros
        if (hotel.address && hotel.address.neighborhood) {
            filter.neighborhoods[hotel.address.neighborhood] = (filter.neighborhoods[hotel.address.neighborhood] || 0) + 1;
        }

        // Contagem de categorias
        const nameLower = (hotel.name || '').toLowerCase();
        let category = 'hotel';
        if (nameLower.includes('pousada')) category = 'pousada';
        else if (nameLower.includes('hostel')) category = 'hostel';
        filter.category[category] = (filter.category[category] || 0) + 1;

        // Contagem de facilities
        if (hotel.facilities && Array.isArray(hotel.facilities)) {
            for (const facility of hotel.facilities) {
                filter.facilities[facility] = (filter.facilities[facility] || 0) + 1;
            }
        }

        // Agregação de dados das tarifas
        if (hotel.rooms && Array.isArray(hotel.rooms)) {
            for (const room of hotel.rooms) {
                if (room.rates && Array.isArray(room.rates)) {
                    for (const rate of room.rates) {
                        // **CORREÇÃO: Ajustado para o novo objeto 'price'**
                        if (rate.price && typeof rate.price.total === 'number') {
                            allPrices.push(rate.price.total);
                        }

                        // Contagem de tipo de pagamento
                        if (rate.payment) {
                            filter.payment[rate.payment] = (filter.payment[rate.payment] || 0) + 1;
                        }

                        // Contagem de cancelamento grátis
                        if (rate.cancellation && rate.cancellation.amount === 0) {
                            filter.cancellation.free++;
                        }

                        // Contagem de regime de alimentação
                        if (rate.board) {
                            filter.board[rate.board] = (filter.board[rate.board] || 0) + 1;
                        }
                    }
                }
            }
        }
    }

    // Finaliza o objeto de moeda
    if (allPrices.length > 0) {
        filter.currency.min = Math.floor(Math.min(...allPrices));
        filter.currency.max = Math.ceil(Math.max(...allPrices));
    } else {
        filter.currency.min = 0;
        filter.currency.max = 0;
    }
    
    // Remove chaves de filtro que não tiveram nenhuma contagem
    Object.keys(filter).forEach(key => {
        if (typeof filter[key] === 'object' && !Array.isArray(filter[key]) && Object.keys(filter[key]).length === 0) {
            // Garante que não apague o objeto de moeda se ele estiver zerado
            if (key !== 'currency') {
                delete filter[key];
            }
        }
    });

    if (filter.cancellation && filter.cancellation.free === 0) {
        delete filter.cancellation;
    }

    return filter;
}
