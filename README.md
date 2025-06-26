# Normalizador de API de Hotéis

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)
![Express.js](https://img.shields.io/badge/Express.js-4.x-_?style=for-the-badge&logo=express)
![JavaScript](https://img.shields.io/badge/JavaScript-ESM-yellow?style=for-the-badge&logo=javascript) 

Serviço de middleware construído em Node.js e Express.js, projetado para receber dados de múltiplas APIs de provedores de hotelaria, normalizando-os em um formato JSON único, consistente e hierárquico.

## 🚀 Sobre o Projeto

O objetivo principal deste serviço é atuar como uma camada de tradução (adapter) entre diferentes fornecedores de dados de hotéis e um sistema consumidor. Ele garante que, independentemente da estrutura complexa e variada dos dados de origem, a aplicação final sempre receberá um objeto JSON padronizado e fácil de usar.

A arquitetura atual foca em **qualidade, performance e previsibilidade**, utilizando mapeadores manuais específicos para cada provedor suportado.

### ✨ Funcionalidades

- **Arquitetura de Adaptadores:** O sistema é construído em torno de "adaptadores" que isolam a lógica de cada provedor, tornando o sistema fácil de manter e escalar.
- **Mapeadores Manuais:** A normalização é feita através de código JavaScript direto, garantindo máxima performance, confiabilidade e custo zero (sem dependência de LLMs).
- **Estrutura de Saída Agrupada:** As respostas agrupam todas as ofertas (combinações de quarto, preço e políticas) sob um único objeto de hotel, evitando duplicatas e facilitando o consumo dos dados pelo frontend.
- **Validação de Schema:** Utiliza AJV para garantir a integridade e o formato da resposta final (funcionalidade opcional).

## 🛠️ Tecnologias Utilizadas

- **Node.js:** Ambiente de execução backend.
- **Express.js:** Framework para a criação do servidor e das rotas da API.
- **AJV:** Validador de schema JSON para garantir a qualidade dos dados de saída.
- **Lodash (`get`):** Para acessar propriedades de objetos de forma segura e evitar erros.
- **Nodemon:** Para reiniciar o servidor automaticamente durante o desenvolvimento.

## 🏁 Como Começar

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/pass-api-challenge.git](https://github.com/seu-usuario/pass-api-challenge.git)
    ```

2.  **Navegue até a pasta do projeto:**
    ```bash
    cd pass-api-challenge
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - No momento, este arquivo contém apenas a porta do servidor (`PORT`).

### Executando o Projeto

- **Modo de Desenvolvimento (com auto-reload):**
  ```bash
  npm run dev
  ```

- **Modo de Produção:**
  ```bash
  npm start
  ```

O servidor estará disponível em `http://localhost:3000` (ou na porta que você definir no seu arquivo `.env`).

## 📡 Uso da API

Para usar o serviço, envie uma requisição `POST` para o endpoint de normalização.

**Endpoint:** `POST /api/normalize`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Corpo da Requisição (Body):**
```json
{
  "provider": "omnibees",
  "rawData": {
    // ... cole aqui o objeto JSON completo da API do provedor ...
  }
}
```

- `provider`: Uma string que identifica o provedor dos dados (ex: "omnibees"). O nome deve corresponder a um adaptador configurado em `/providers/config`.
- `rawData`: O objeto JSON bruto retornado pela API do provedor.

## 📁 Estrutura do Projeto

```
/
|-- /providers      # Lógica de mapeamento para cada provedor
|   |-- /config     # Arquivos de configuração (caminhos dos dados)
|   `-- /mappers    # Funções de transformação manual
|-- /routes         # Definição das rotas da API
|-- /strategies     # Orquestrador da lógica de normalização
|-- /utils          # Ferramentas compartilhadas (validador, etc.)
`-- server.js       # Ponto de entrada da aplicação
```

## 🧩 Como Adicionar um Novo Provedor

A arquitetura foi pensada para ser facilmente extensível:

1.  **Crie um arquivo de configuração:** Adicione `novo-provedor.config.js` em `/providers/config/`. Este arquivo deve exportar um objeto com os caminhos para os arrays de hotéis e extras no JSON do novo provedor.
2.  **Crie um arquivo de mapeamento:** Adicione `novo-provedor.mapper.js` em `/providers/mappers/`. Este arquivo deve conter a lógica para transformar os dados brutos do provedor no nosso schema padrão.
3.  **Registre o adaptador:** Atualize os arquivos `index.js` dentro de `/providers/config/` e `/providers/mappers/` para importar e exportar sua nova configuração e mapeador.
