export async function getProviderAdapter(providerName) {
  if (!providerName) {
    console.error('Nome do provedor não fornecido.');
    return null;
  }

  try {
    const configPath = `../../integrations/${providerName}/${providerName}.config.js`;
    const mapperPath = `../../integrations/${providerName}/${providerName}.mapper.js`;
    const [configModule, mapperModule] = await Promise.all([
      import(configPath),
      import(mapperPath)
    ]);

    const configKey = `${providerName}Config`; // ex: 'omnibeesConfig'
    const mapperKey = `${providerName}Mapper`; // ex: 'omnibeesMapper'

    const config = configModule[configKey];
    const mapper = mapperModule[mapperKey];

    if (!config || !mapper) {
      throw new Error(`Configuração ou mapper não encontrado para o provedor '${providerName}'. Verifique as exportações nos arquivos.`);
    }

    return { config, mapper };

  } catch (error) {
    console.error(`Falha ao carregar o adaptador para o provedor '${providerName}'.`, error);
    return null;
  }
}