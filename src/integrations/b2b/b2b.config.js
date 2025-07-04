export const b2bConfig = {
  /**
   * O endpoint principal para os serviços da API B2B.
   */
  endpoint: "https://ws-hmg.b2breservas.com.br/b2bws-homolog-v2/OTAHotel",

  /**
   * Credenciais de autenticação para a API.
   */
  credentials: {
    // Credenciais para o <soapenv:Header> e para a autenticação Basic
    user: "ws_copastur",
    password: "R93bFbdp",

    // Credenciais para o <ota:RequestorID>
    requestorId: "46849",
    requestorPass: "9794629369862380",
  },

  /**
   * Define o caminho para o array que contém o objeto principal da resposta.
   * O orquestrador usará este caminho para extrair o objeto OTA_HotelAvailRS.
   */
  hotelArrayPath: 'soap:Body.ota:OTA_HotelAvailRS',
};