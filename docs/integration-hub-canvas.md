# Integration Hub - Canvas da Aplicação

## 🎯 Visão Geral
**Gerenciador de Integrações para Normalização de Responses de Múltiplos Provedores**

O Integration Hub é uma plataforma robusta que atua como um hub central para normalizar dados de diferentes provedores de hospedagem, transformando estruturas heterogêneas em um formato padronizado e consistente.

---

## 🏗️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        🌐 API GATEWAY                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │Rate Limiting│ │    Auth     │ │   Logging   │ │   Metrics   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    🎭 ORCHESTRATION LAYER                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │  Hotelbeds  │ │  Omnibees   │ │   Booking   │ │   Future    ││
│  │   Adapter   │ │   Adapter   │ │   Adapter   │ │  Providers  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     ⚙️ SERVICES LAYER                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │   Parser    │ │   Mapper    │ │ Validation  │ │    Cache    ││
│  │  Service    │ │  Service    │ │  Service    │ │  Service    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      💾 DATA LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │    Redis    │ │ PostgreSQL  │ │   Config    │ │    Logs     ││
│  │    Cache    │ │  Database   │ │   Store     │ │   Storage   ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
integration-hub/
├── 📂 src/
│   ├── 📂 api/                    # Camada de API
│   │   ├── 📂 routes/
│   │   │   ├── normalize.js       # Endpoint principal de normalização
│   │   │   ├── providers.js       # Gerenciamento de provedores
│   │   │   ├── health.js          # Health checks
│   │   │   └── admin.js           # Endpoints administrativos
│   │   ├── 📂 middleware/
│   │   │   ├── auth.js            # Autenticação
│   │   │   ├── validation.js      # Validação de requests
│   │   │   ├── rateLimit.js       # Rate limiting
│   │   │   └── logging.js         # Request logging
│   │   └── 📂 controllers/
│   │       ├── normalize.controller.js
│   │       └── provider.controller.js
│   │
│   ├── 📂 core/                   # Camada de Orquestração
│   │   ├── 📂 orchestrator/
│   │   │   ├── pipeline.js        # Pipeline principal
│   │   │   ├── factory.js         # Factory de adaptadores
│   │   │   └── coordinator.js     # Coordenador de processos
│   │   ├── 📂 adapters/
│   │   │   ├── 📂 hotelbeds/
│   │   │   │   ├── mapper.js
│   │   │   │   ├── validator.js
│   │   │   │   └── config.js
│   │   │   ├── 📂 omnibees/
│   │   │   │   ├── mapper.js
│   │   │   │   ├── validator.js
│   │   │   │   └── config.js
│   │   │   └── 📂 base/
│   │   │       ├── adapter.interface.js
│   │   │       └── mapper.base.js
│   │   └── 📂 providers/
│   │       ├── registry.js        # Registro de provedores
│   │       └── detector.js        # Detecção automática
│   │
│   ├── 📂 services/               # Camada de Serviços
│   │   ├── parser.service.js      # Parsing de texto livre
│   │   ├── mapper.service.js      # Mapeamento de dados
│   │   ├── validation.service.js  # Validação de schemas
│   │   ├── cache.service.js       # Gerenciamento de cache
│   │   ├── config.service.js      # Configurações dinâmicas
│   │   └── monitoring.service.js  # Monitoramento e métricas
│   │
│   ├── 📂 data/                   # Camada de Dados
│   │   ├── 📂 repositories/
│   │   │   ├── provider.repository.js
│   │   │   ├── mapping.repository.js
│   │   │   └── config.repository.js
│   │   ├── 📂 models/
│   │   │   ├── provider.model.js
│   │   │   ├── mapping.model.js
│   │   │   └── hotel.model.js
│   │   └── 📂 migrations/
│   │       ├── 001_create_providers.sql
│   │       ├── 002_create_mappings.sql
│   │       └── 003_create_configs.sql
│   │
│   ├── 📂 utils/                  # Utilitários
│   │   ├── logger.js              # Sistema de logs
│   │   ├── errors.js              # Tratamento de erros
│   │   ├── constants.js           # Constantes do sistema
│   │   └── helpers.js             # Funções auxiliares
│   │
│   └── 📂 config/                 # Configurações
│       ├── database.js            # Config do banco
│       ├── redis.js               # Config do Redis
│       ├── providers.js           # Config dos provedores
│       └── app.js                 # Config da aplicação
│
├── 📂 tests/                      # Testes
│   ├── 📂 unit/
│   ├── 📂 integration/
│   └── 📂 e2e/
│
├── 📂 docs/                       # Documentação
│   ├── api.md                     # Documentação da API
│   ├── providers.md               # Guia de provedores
│   └── deployment.md              # Guia de deploy
│
├── 📂 scripts/                    # Scripts utilitários
│   ├── setup.js                  # Setup inicial
│   ├── migrate.js                 # Migrações
│   └── seed.js                    # Dados iniciais
│
└── 📂 docker/                     # Containerização
    ├── Dockerfile
    ├── docker-compose.yml
    └── nginx.conf
```

---

## 🔄 Fluxos Principais

### 1. Fluxo de Normalização (Core)
```
[Cliente] → [API Gateway] → [Orchestrator] → [Provider Adapter] → [Services] → [Response]
    ↓           ↓               ↓                ↓                  ↓
[Validation] [Rate Limit] [Provider Detection] [Data Mapping] [Cache Check]
```

### 2. Fluxo de Administração
```
[Admin Panel] → [Admin API] → [Config Service] → [Database] → [Cache Invalidation]
```

### 3. Fluxo de Monitoramento
```
[All Components] → [Monitoring Service] → [Metrics Store] → [Dashboard/Alerts]
```

---

## 🎛️ Componentes Principais

### **API Gateway**
- **Rate Limiting**: Controle de taxa por IP/usuário
- **Authentication**: JWT/API Key validation
- **Request Logging**: Log estruturado de todas as requisições
- **Metrics Collection**: Coleta de métricas de performance

### **Orchestration Layer**
- **Provider Factory**: Criação dinâmica de adaptadores
- **Pipeline Manager**: Gerenciamento do fluxo de normalização
- **Provider Registry**: Registro e descoberta de provedores
- **Error Handling**: Tratamento centralizado de erros

### **Services Layer**
- **Parser Service**: Extração de dados de texto livre
- **Mapper Service**: Transformação de estruturas de dados
- **Validation Service**: Validação de schemas de entrada/saída
- **Cache Service**: Gerenciamento inteligente de cache

### **Data Layer**
- **Redis Cache**: Cache distribuído para performance
- **PostgreSQL**: Persistência de configurações e metadados
- **Config Store**: Configurações dinâmicas por provedor
- **Audit Logs**: Logs de auditoria para compliance

---

## 🔧 Funcionalidades Chave

### **Normalização Inteligente**
- ✅ Detecção automática de provedor
- ✅ Mapeamento configurável de campos
- ✅ Parsing de texto livre para extração de dados
- ✅ Validação rigorosa de entrada e saída

### **Gerenciamento Dinâmico**
- ✅ Configuração de mapeamentos via API
- ✅ Adição de novos provedores sem restart
- ✅ Versionamento de configurações
- ✅ Rollback de configurações

### **Observabilidade**
- ✅ Métricas detalhadas por provedor
- ✅ Logs estruturados com correlação
- ✅ Health checks granulares
- ✅ Alertas proativos

---

## 🚀 Endpoints Principais

### **Normalização**
```
POST /api/v1/normalize
{
  "provider": "hotelbeds",
  "data": { ... },
  "options": {
    "strict_validation": true,
    "cache_ttl": 3600
  }
}
```

### **Administração**
```
GET    /api/v1/providers              # Listar provedores
POST   /api/v1/providers              # Adicionar provedor
PUT    /api/v1/providers/{id}/config  # Atualizar configuração
GET    /api/v1/mappings/{provider}    # Obter mapeamentos
PUT    /api/v1/mappings/{provider}    # Atualizar mapeamentos
```

### **Monitoramento**
```
GET /api/v1/health                    # Health check geral
GET /api/v1/health/{provider}         # Health check específico
GET /api/v1/metrics                   # Métricas do sistema
GET /api/v1/stats                     # Estatísticas de uso
```