import { providerConfigs } from "../providers/config/index.js";
import { mappers } from "../providers/mappers/index.js";

export function getProviderAdapter(providerName){
    if (!providerName || !providerConfigs[providerName]) {
        return null;
    }

    const config = providerConfigs[providerName];
    const mapper = mappers[providerName];

    return {config, mapper};
}