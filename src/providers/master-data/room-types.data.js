export const roomTypesMap = new Map(Object.entries({
    "AC": "Accessible Room (Quarto adaptado para PCD)",
    "AP": "Apartment (Apartamento completo)",
    "BG": "Bungalow (Bangâlo, comum em resorts)",
    "CB": "Cabana (Chalé ou bangalô independente)",
    "CP": "Capsule (Cápsula individual, comum em hotéis cápsula)",
    "CR": "Connecting Room (Quartos interligados)",
    "DM": "Dormitory (Dormitório compartilhado, comum em hostels)",
    "DB": "Double (Quarto duplo)",
    "FR": "Family Room (Quarto familiar)",
    "LF": "Loft (Unidade ampla, conceito aberto)",
    "MS": "Master Suite (Suíte de alto padrão)",
    "PH": "Penthouse (Cobertura de luxo)",
    "PS": "Presidential Suite (Suíte presidencial, a mais luxuosa)",
    "QD": "Quadruple (Quarto quádruplo)",
    "SG": "Single (Quarto individual)",
    "ST": "Studio (Quarto tipo estúdio)",
    "SU": "Suite (Suíte padrão)",
    "TR": "Triple (Quarto triplo)",
    "TW": "Twin (Quarto com duas camas de solteiro)",
    "VL": "Villa (Casa privativa dentro do hotel ou resort)"
}));

export const MASTER_ROOM_TYPE_LIST_FOR_AI = Array.from(roomTypesMap.entries())
    .map(([code, name]) => ({ code, name }));