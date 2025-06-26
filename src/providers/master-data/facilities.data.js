export const facilitiesMap = new Map(Object.entries({
    "POOL": "Piscina",
    "PARK": "Estacionamento",
    "GYM": "Academia / Fitness Center",
    "SPA": "Spa / Centro de Bem-Estar",
    "REST": "Restaurante",
    "BAR": "Bar / Lounge",
    "WIFI": "Wi-Fi nas áreas comuns",
    "MEET": "Salas de Reunião / Conferência",
    "ACC": "Acessibilidade para PCD",
    "PET": "Aceita animais de estimação",
    "BEACH": "Acesso à praia / Frente-mar",
    "PLAY": "Playground / Área infantil"
}));

export const MASTER_FACILITIES_LIST_FOR_AI = Array.from(facilitiesMap.entries()).map(([code, name]) => ({ code, name }));