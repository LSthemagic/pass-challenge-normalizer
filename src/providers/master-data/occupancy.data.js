// providers/master-data/occupancy.data.js
export const occupancyMap = new Map(Object.entries({
    "BV": "Bungalow/Villa (Capacidade variável)",
    "D2": "Double (2 pessoas)",
    "F6": "Family Room (4 a 6 pessoas)",
    "Q4": "Quadruple (4 pessoas)",
    "Q5": "Quintuple (5 pessoas)",
    "Q6": "Sextuple (6 pessoas)",
    "SD": "Shared Dormitory (Várias pessoas)",
    "S1": "Single (1 pessoa)",
    "SE": "Suite Especial (Capacidade variável)",
    "T3": "Triple (3 pessoas)",
    "T2": "Twin (2 pessoas - duas camas)"
}));

export const MASTER_OCCUPANCY_LIST_FOR_AI = Array.from(occupancyMap.entries()).map(([code, name]) => ({ code, name }));