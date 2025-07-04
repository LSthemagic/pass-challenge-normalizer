import { b2bConfig } from '../integrations/b2b/b2b.config.js';
import { Parser } from 'xml2js';

function buildHotelbedsPayload(searchParams) {
  return {
    type: 'hotelbeds',
    stay: {
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
    },
    occupancies: searchParams.rooms.map(room => ({
      rooms: 1,
      adults: room.adults,
      children: room.children.length,
    })),
    destination: {
      code: searchParams.destinationCode,
    },
    filter: {
      maxHotels: 50,
    },
  };
}

/**
 * Constrói o payload para o provedor Omnibees.
 * @param {object} searchParams - Os parâmetros da busca.
 * @returns {object} O corpo da requisição para a Omnibees.
 */
function buildOmnibeesPayload(searchParams) {
  // Lista estática de códigos de hotel para teste, como solicitado.
  const staticHotelCodes = ["2192", "2195", "2196", "2197", "2198", "2199", "2200", "2240", "2462", "2788"];

  return {
    type: "omnibees",
    AvailRatesOnly: true,
    BestOnly: false,
    EchoToken: "teste-pass-connect",
    // CORREÇÃO: Adicionado o TimeStamp dinâmico para cada requisição.
    TimeStamp: new Date().toISOString(),
    HotelSearchCriteria: {
      Criterion: {
        HotelRefs: staticHotelCodes.map(code => ({ HotelCode: code })),
        RoomStayCandidatesType: {
          RoomStayCandidates: searchParams.rooms.map(room => ({
            GuestCountsType: {
              GuestCounts: [{
                AgeQualifyCode: 10, // 10 para Adulto
                Count: room.adults,
              }],
            },
            Quantity: 1,
          })),
        },
        StayDateRange: {
          Start: searchParams.checkIn,
          End: searchParams.checkOut,
        },
        TPA_Extensions: {
          IncludeAllFittingOccupations: true,
          MultimediaObjects: { SendData: false },
        },
      },
    },
    POS: {
      Sources: [{ ISOCountry: "BRA" }],
    },
    // AJUSTE: Alterado para o código de linguagem numérico que a API parece esperar.
    PrimaryLangID: 8,
    Version: 5,
  };
}

// Mapa de estratégias: mapeia um provider a sua função de construção de payload.
const payloadBuilders = {
  hotelbeds: buildHotelbedsPayload,
  omnibees: buildOmnibeesPayload,
  // Para adicionar um novo provedor, basta adicionar a função aqui.
  // ex: newProvider: buildNewProviderPayload,
};


// --- FUNÇÃO DE FETCH GENÉRICA E REATORADA ---

/**
 * Função genérica para buscar dados na API de hotéis.
 * Ela seleciona a estratégia correta para construir o payload.
 * @param {string} providerType - O nome do provedor ('omnibees', 'hotelbeds').
 * @param {object} searchParams - Os parâmetros da busca.
 * @returns {Promise<object>} Os dados brutos do provedor.
 */
async function fetchApiData(providerType, searchParams) {
  const API_URL = 'https://us-east1-prj-infra-europlus.cloudfunctions.net/hotels';
  
  // Seleciona a função de construção de payload correta do mapa de estratégias.
  const buildPayload = payloadBuilders[providerType];

  if (!buildPayload) {
    const errorMsg = `[ProviderService] Nenhum construtor de payload encontrado para o provedor: ${providerType}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Constrói o corpo da requisição usando a estratégia selecionada.
  const requestBody = buildPayload(searchParams);

  console.log(`[ProviderService] Enviando requisição para ${providerType} com o corpo:`, JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[ProviderService] Erro na API para ${providerType}: ${response.status}`, errorBody);
      throw new Error(`Falha ao buscar dados de ${providerType}. Status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error(`[ProviderService] Exceção ao buscar dados de ${providerType}:`, error);
    if (providerType === 'hotelbeds') {
        return { hotels: [] };
    }
    return [];
  }
}


export async function fetchOmnibeesData(searchParams) {
  // Chama a função genérica especificando o tipo 'omnibees'
  const omnibeesResponse = await fetchApiData('omnibees', searchParams);
  // O mapeador da Omnibees espera o array de hotéis diretamente.
  return omnibeesResponse || [];
}

export async function fetchHotelbedsData(searchParams) {
  // Chama a função genérica especificando o tipo 'hotelbeds'
  const hotelbedsResponse = await fetchApiData('hotelbeds', searchParams);
  // O mapeador da Hotelbeds espera um objeto com a chave 'hotels'.
  return hotelbedsResponse.hotels || { hotels: [] };
}

function buildB2BRequestXML(searchParams) {
  const { user, password, requestorId, requestorPass } = b2bConfig.credentials;
  
  // Usar valores padrão que funcionam se os parâmetros não estiverem disponíveis
  const checkIn = searchParams?.checkIn || "2025-09-01";
  const checkOut = searchParams?.checkOut || "2025-09-03";
  const destinationCode = searchParams?.destinationCode || "POA";
  const rooms = searchParams?.rooms || [{ adults: 1, children: [] }];

  // console.log('[B2B] Usando parâmetros:', { checkIn, checkOut, destinationCode, rooms });

  const roomStayCandidatesXML = rooms.map((room) => `
	            <RoomStayCandidate>
	              <GuestCounts IsPerRoom="true">
	                <GuestCount AgeQualifyingCode="10" Count="${room.adults || 1}"/>
	                ${(room.children || []).map(child => `	                <GuestCount AgeQualifyingCode="8" Age="${child.age}" Count="1"/>`).join('\n')}
	              </GuestCounts>
	            </RoomStayCandidate>`).join('');

  const xmlRequest = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://www.b2breservas.com.br/b2bws/types/" xmlns:ota="http://www.opentravel.org/OTA/2003/05/alpha">
   <soapenv:Header>
      <typ:User>${user}</typ:User>
      <typ:Password>${password}</typ:Password>
   </soapenv:Header>
  <soapenv:Body>
	    <OTA_HotelAvailRQ Version="3.000" EchoToken="202409131836" xmlns="http://www.opentravel.org/OTA/2003/05/alpha">
	      <POS>
	        <Source>
	          <RequestorID Type="5" ID="${requestorId}" MessagePassword="${requestorPass}"/>
	        </Source>
	      </POS>
	      <AvailRequestSegments>
	        <AvailRequestSegment>
	          <HotelSearchCriteria>
	            <Criterion>
	              <HotelRef HotelCityCode="${destinationCode}"/>
	            </Criterion>
	          </HotelSearchCriteria >
	          <StayDateRange Start="${checkIn}" End="${checkOut}"/>
	          <RoomStayCandidates>${roomStayCandidatesXML}
	          </RoomStayCandidates>
	        </AvailRequestSegment>
	      </AvailRequestSegments>
	    </OTA_HotelAvailRQ>
	  </soapenv:Body>
</soapenv:Envelope>`;

  return xmlRequest;
}

export async function fetchB2BData(searchParams) {
  // console.log('[B2B] Parâmetros recebidos:', JSON.stringify(searchParams, null, 2));
  
  const { user, password, requestorId, requestorPass } = b2bConfig.credentials;
  const basicAuthToken = Buffer.from(`${user}:${password}`).toString('base64');

  // 1) Monta o XML de request exatamente como você já faz
  const requestBody = buildB2BRequestXML(searchParams);

  // console.log('[B2B] Enviando requisição XML:', requestBody);

  // 2) Envia a requisição igual ao Postman
  const response = await fetch(b2bConfig.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'Authorization': `Basic ${basicAuthToken}`
    },
    body: requestBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[B2B] Erro na resposta:', response.status, errorText);
    throw new Error(`Erro B2B: ${response.status} - ${errorText}`);
  }

  const xmlResponse = await response.text();
  // console.log('[B2B] Resposta XML recebida:', xmlResponse);

  // 3) Configura o xml2js para preservar a estrutura completa
  const parser = new Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitRoot: false,
    trim: true,
    // Mantém todos os namespaces para preservar a estrutura original
    tagNameProcessors: []
  });

  // 4) Parseia o XML em JS
  const parsed = await parser.parseStringPromise(xmlResponse);

  // console.log('[B2B] Dados parseados:', JSON.stringify(parsed, null, 2));

  // 5) Retorna todos os dados do XML parseado
  return parsed;
}