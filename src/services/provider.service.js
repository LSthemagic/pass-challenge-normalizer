import { promises as fs } from 'fs';
import path from 'path';

// Função para ler e fazer o parse de um ficheiro JSON de forma segura.
async function readJsonFile(fileName) {
  try {
    // Constrói o caminho para a pasta 'data' na raiz do projeto.
    const filePath = path.join(process.cwd(), 'data', fileName);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler o ficheiro ${fileName}:`, error);
    // Retorna um objeto que não causará erro no mapper.
    return { hotels: [] }; 
  }
}

/**
 * Simula a busca de dados do provedor Omnibees.
 * @returns {Promise<object>} Os dados brutos da Omnibees.
 */
export async function fetchOmnibeesData() {
  // Lê o ficheiro de resposta da Omnibees
  const omnibeesResponse = await readJsonFile('response omnibees.json');
  return omnibeesResponse || [];
}

/**
 * Simula a busca de dados do provedor Hotelbeds.
 * @returns {Promise<object>} Os dados brutos da Hotelbeds.
 */
export async function fetchHotelbedsData() {
  // Lê o ficheiro de resposta da Hotelbeds
  const hotelbedsResponse = await readJsonFile('hotelbeds_response.json');
  return hotelbedsResponse.hotels || [];
}
