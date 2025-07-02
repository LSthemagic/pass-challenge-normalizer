export async function getProviderAdapter(providerName) {
  if (!providerName) {
    console.error('Nome do provedor não fornecido.');
    return null;
  }

  try {
    const configPath = `../../integrations/${providerName}/${providerName}.config.js`;
    const mapperPath = `../../integrations/${providerName}/${providerName}.mapper.js`;

    console.log("Path ",configPath)
    console.log("Path ",mapperPath)

    const [configModule, mapperModule] = await Promise.all([
      import(configPath),
      import(mapperPath)
    ]);

    // --- LÓGICA DE EXTRAÇÃO (A MUDANÇA ESTÁ AQUI) ---

    // Constrói o nome da chave que esperamos encontrar nos arquivos exportados
    const configKey = `${providerName}Config`; // ex: 'omnibeesConfig'
    const mapperKey = `${providerName}Mapper`; // ex: 'omnibeesMapper'

    console.log(configKey)
    console.log(mapperKey)
    console.log(configModule)
    // Extrai o objeto de configuração de dentro do módulo
    const config = configModule[configKey];
    // Extrai o objeto mapper de dentro do módulo
    const mapper = mapperModule[mapperKey];

    console.log("config: ", config)

    // Validação para garantir que os objetos foram encontrados
    if (!config || !mapper) {
      throw new Error(`Configuração ou mapper não encontrado para o provedor '${providerName}'. Verifique as exportações nos arquivos.`);
    }

    // Retorna os objetos corretos, e não mais os módulos inteiros
    return { config, mapper };

  } catch (error) {
    console.error(`Falha ao carregar o adaptador para o provedor '${providerName}'.`, error);
    return null;
  }
}