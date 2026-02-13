# Dialogix CRM - Plataforma Omnichannel com IA

## 📋 Visão Geral do Projeto

**Dialogix CRM** é uma plataforma moderna de CRM Omnichannel SaaS focada em atendimento, vendas e inteligência artificial. Integra múltiplos canais de comunicação (WhatsApp, Instagram, Telegram, E-mail) com pipeline de vendas, automação e agentes de IA.

### 🎯 Objetivos Principais

- **Unificação de Canais**: Centralizar atendimento de múltiplos canais em uma única interface
- **Inteligência Artificial**: Potencializar atendimento e vendas com agentes de IA (Gemini, ChatGPT, Grok, Claude)
- **Insights e Analytics**: Dashboard completo com KPIs e métricas de desempenho
- **Modelo SaaS**: Sistema multi-tenant com gestão de assinaturas e pagamentos
- **Mobile First**: Interface responsiva para todos os dispositivos
- **Escalabilidade**: Arquitetura preparada para crescimento de 10 a 10.000+ empresas

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico

#### **Backend**
- **Runtime**: Node.js 20+ LTS
- **Framework**: NestJS 10+ (TypeScript)
- **ORM**: TypeORM com PostgreSQL
- **Cache**: Redis (sessões, filas, cache)
- **WebSockets**: Socket.io (chat em tempo real)
- **Filas**: BullMQ (processamento assíncrono)
- **Autenticação**: JWT + Passport.js
- **Validação**: Class-validator + Class-transformer
- **Documentação**: Swagger/OpenAPI

#### **Frontend**
- **Framework**: React 18+ com TypeScript
- **Build Tool**: Vite 5+
- **Roteamento**: React Router v6
- **Estado Global**: Zustand
- **UI Library**: TailwindCSS 3+ + Shadcn/ui
- **Ícones**: Lucide React + FontAwesome
- **Formulários**: React Hook Form + Zod
- **Requisições**: Axios + React Query
- **WebSockets**: Socket.io-client
- **Charts**: Chart.js + React-Chartjs-2
- **Editor**: TipTap (editor de texto rico)
- **Date/Time**: Day.js

#### **Banco de Dados**
- **Principal**: PostgreSQL 15+ (dados estruturados)
- **Cache/Sessões**: Redis 7+ (dados temporários)
- **Armazenamento**: AWS S3 / MinIO (arquivos e mídias)

#### **Infraestrutura**
- **Servidor**: VPS Linux Ubuntu 22.04 LTS
- **Proxy Reverso**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Process Manager**: PM2
- **Container**: Docker + Docker Compose (opcional)
- **Monitoramento**: PM2 Monitor / New Relic

#### **Integrações Externas**
- **WhatsApp**: Evolution API / Baileys
- **Instagram**: Meta Graph API
- **Telegram**: Telegram Bot API
- **E-mail**: SMTP (SendGrid/Mailgun)
- **Pagamentos**: Stripe / Mercado Pago / Asaas
- **IA**: OpenAI API, Anthropic Claude, Google Gemini, xAI Grok
- **Automação**: Webhook + n8n integration
- **E-commerce**: APIs de Shopify, WooCommerce, VTEX

---

## 📊 Modelagem de Dados (Resumo)

### Entidades Principais

1. **Tenants (Empresas)** - Multi-tenancy
2. **Users (Usuários)** - Membros da equipe
3. **Contacts (Contatos)** - Leads e clientes
4. **Conversations (Conversas)** - Atendimentos
5. **Messages (Mensagens)** - Histórico de mensagens
6. **Channels (Canais)** - Conexões (WhatsApp, Instagram, etc.)
7. **Pipelines (Funis)** - Pipeline de vendas
8. **Deals (Oportunidades)** - Negociações
9. **Tasks (Tarefas)** - Gestão de tarefas
10. **Tags (Etiquetas)** - Organização
11. **QuickReplies (Respostas Rápidas)** - Templates
12. **AIAgents (Agentes de IA)** - Configurações de IA
13. **Subscriptions (Assinaturas)** - Planos SaaS
14. **Payments (Pagamentos)** - Histórico financeiro

---

## 🗺️ Roadmap de Desenvolvimento

### **Fase 1: Fundação (Semanas 1-2)**
- ✅ Estruturar projeto backend (NestJS)
- ✅ Estruturar projeto frontend (React + Vite)
- ✅ Configurar PostgreSQL + TypeORM
- ✅ Configurar Redis
- ✅ Criar modelagem completa do banco
- ✅ Sistema de autenticação (JWT)
- ✅ Multi-tenancy básico
- ✅ Design system (componentes base Shadcn/UI)

### **Fase 2: Módulos Core (Semanas 3-5)**
- ✅ **Módulo de Usuários**
  - ✅ CRUD de usuários
  - 🔄 Perfis e permissões
  - 🔄 Upload de foto de perfil
  
- 🔄 **Módulo de Contatos**
  - ✅ CRUD de contatos (Backend)
  - ✅ Listagem e Busca (Frontend)
  - 🔄 Formulários de Criação/Edição
  - 🔄 Visão 360º do contato
  
- 🔄 **Módulo de Canais**
  - Configuração de canais
  - Integração com APIs externas
  - Status de conexão

### **Fase 3: Atendimento (Semanas 6-8)**
- 🔄 **Tela de Atendimento (Principal)**
  - Lista de conversas em tempo real
  - Interface de chat com WebSocket
  - Envio/recebimento de mensagens
  - Suporte a mídias (foto, vídeo, áudio, documentos)
  - Respostas rápidas
  - Transferência de atendimento
  - Notas internas
  - Histórico completo
  - Filtros avançados

- 🔄 **Sistema de Notificações**
  - Notificações em tempo real
  - Badge de mensagens não lidas
  - Sons de notificação

### **Fase 4: Vendas (Semanas 9-11)**
- 🔄 **Pipeline de Vendas**
  - Criação de múltiplos pipelines
  - Visualização Kanban
  - Drag and drop de cards
  - KPIs por pipeline
  
- 🔄 **Gestão de Oportunidades**
  - CRUD de deals
  - Histórico de movimentações
  - Previsão de fechamento
  - Valor estimado

- 🔄 **Tarefas**
  - CRUD de tarefas
  - Calendário de tarefas
  - Notificações de vencimento

### **Fase 5: Automação e IA (Semanas 12-14)**
- 🔄 **Follow-up Automático**
  - Criação de fluxos
  - Agendamento de mensagens
  - Triggers baseados em eventos
  
- 🔄 **Agentes de IA**
  - Configuração de agentes
  - Integração com LLMs (GPT, Claude, Gemini, Grok)
  - Treinamento com base de conhecimento
  - Respostas automáticas
  - Handoff para humano

### **Fase 6: Analytics e Relatórios (Semanas 15-16)**
- 🔄 **Dashboard Principal**
  - KPIs em tempo real
  - Gráficos de desempenho
  - Métricas por canal
  - Performance da equipe
  
- 🔄 **Relatórios**
  - Relatórios pré-definidos
  - Relatórios personalizados
  - Exportação (PDF, Excel)
  - Agendamento de relatórios

### **Fase 7: SaaS e Financeiro (Semanas 17-18)**
- 🔄 **Módulo de Assinaturas**
  - Gestão de planos
  - Upgrade/downgrade
  - Trial period
  
- 🔄 **Integração de Pagamentos**
  - Stripe/Mercado Pago
  - Cartão de crédito recorrente
  - Histórico de pagamentos
  - Notas fiscais
  
- 🔄 **Configurações de Marca**
  - Upload de logo
  - Customização de cores
  - White-label básico

### **Fase 8: Integrações (Semanas 19-20)**
- 🔄 **Webhook**
  - Sistema de webhooks personalizados
  - Logs de requisições
  
- 🔄 **n8n Integration**
  - Conectores para n8n
  
- 🔄 **E-commerce**
  - Shopify connector
  - WooCommerce connector
  - Sincronização de pedidos

### **Fase 9: Refinamento e Otimização (Semanas 21-22)**
- 🔄 Testes de carga e performance
- 🔄 Otimização de queries
- 🔄 Cache estratégico
- 🔄 Compressão de assets
- 🔄 SEO e meta tags
- 🔄 Documentação final

### **Fase 10: Deploy e Monitoramento (Semana 23-24)**
- 🔄 Setup de VPS Ubuntu
- 🔄 Configuração Nginx
- 🔄 SSL/TLS
- 🔄 PM2 setup
- 🔄 Backup automático
- 🔄 Monitoramento
- 🔄 CI/CD com GitHub Actions

---

## 📁 Estrutura de Diretórios

```
dialogix-crm/
├── backend/                    # API Backend (NestJS)
│   ├── src/
│   │   ├── modules/           # Módulos da aplicação
│   │   │   ├── auth/         # Autenticação
│   │   │   ├── tenants/      # Multi-tenancy
│   │   │   ├── users/        # Usuários
│   │   │   ├── contacts/     # Contatos
│   │   │   ├── conversations/# Conversas
│   │   │   ├── messages/     # Mensagens
│   │   │   ├── channels/     # Canais
│   │   │   ├── pipelines/    # Pipeline de vendas
│   │   │   ├── deals/        # Oportunidades
│   │   │   ├── tasks/        # Tarefas
│   │   │   ├── tags/         # Tags
│   │   │   ├── quick-replies/# Respostas rápidas
│   │   │   ├── ai-agents/    # Agentes de IA
│   │   │   ├── webhooks/     # Webhooks
│   │   │   ├── subscriptions/# Assinaturas
│   │   │   ├── payments/     # Pagamentos
│   │   │   └── analytics/    # Analytics e relatórios
│   │   ├── common/           # Código compartilhado
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── config/           # Configurações
│   │   ├── database/         # Migrations e seeds
│   │   └── main.ts           # Entry point
│   ├── test/                 # Testes
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # Interface Frontend (React)
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── ui/          # Componentes base (Shadcn)
│   │   │   ├── layout/      # Layout components
│   │   │   ├── forms/       # Form components
│   │   │   └── shared/      # Shared components
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── Auth/        # Login/Registro
│   │   │   ├── Dashboard/   # Dashboard principal
│   │   │   ├── Attendance/  # Tela de atendimento
│   │   │   ├── Contacts/    # Contatos
│   │   │   ├── Pipeline/    # Pipeline de vendas
│   │   │   ├── Tasks/       # Tarefas
│   │   │   ├── AIAgents/    # Agentes de IA
│   │   │   ├── Reports/     # Relatórios
│   │   │   ├── Settings/    # Configurações
│   │   │   └── Billing/     # Financeiro
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Utilitários
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # Estilos globais
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                     # Documentação completa
│   ├── ARCHITECTURE.md       # Arquitetura detalhada
│   ├── DATABASE.md           # Modelagem de dados
│   ├── API.md               # Documentação de APIs
│   ├── DEPLOYMENT.md        # Guia de deploy
│   └── DEVELOPMENT.md       # Guia de desenvolvimento
│
├── docker-compose.yml       # Docker setup (desenvolvimento)
└── README.md               # Este arquivo
```

---

## 🚀 Como Começar

### Pré-requisitos

- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Yarn ou npm

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd dialogix-crm

# 2. Backend setup
cd backend
cp .env.example .env
# Configure suas variáveis de ambiente
yarn install
yarn migration:run
yarn seed:run
yarn start:dev

# 3. Frontend setup (em outro terminal)
cd frontend
cp .env.example .env
# Configure suas variáveis de ambiente
yarn install
yarn dev
```

### Acessar a aplicação

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

---

## 🎨 Design System

### Cores Principais

**Light Mode:**
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Success: #10b981 (Green)
- Warning: #f59e0b (Amber)
- Danger: #ef4444 (Red)
- Background: #ffffff
- Surface: #f9fafb
- Text: #111827

**Dark Mode:**
- Primary: #818cf8
- Secondary: #a78bfa
- Success: #34d399
- Warning: #fbbf24
- Danger: #f87171
- Background: #0f172a
- Surface: #1e293b
- Text: #f1f5f9

### Tipografia

- Font Family: Inter, system-ui, sans-serif
- Headings: Poppins (Bold)
- Body: Inter (Regular)
- Code: Fira Code (Monospace)

---

## 📚 Documentação Adicional

Consulte a pasta `/docs` para documentação detalhada:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura completa do sistema
- [DATABASE.md](docs/DATABASE.md) - Modelagem de banco de dados
- [API.md](docs/API.md) - Documentação de endpoints
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Guia de deploy na VPS
- [DEVELOPMENT.md](docs/DEVELOPMENT.md) - Guia para desenvolvedores

---

## 🤝 Contribuindo

Este é um projeto em desenvolvimento ativo. Siga as práticas de Git Flow:

- `main` - Branch de produção
- `develop` - Branch de desenvolvimento
- `feature/*` - Features novas
- `bugfix/*` - Correções de bugs
- `hotfix/*` - Hotfixes urgentes

---

## 📝 Licença

Propriedade privada. Todos os direitos reservados.

---

## 📧 Contato

Para dúvidas ou sugestões sobre o projeto Dialogix CRM, entre em contato.

---

**Última Atualização**: 13 de Fevereiro de 2026
**Versão**: 0.2.0 (Alpha)
**Status**: 🚧 Em Desenvolvimento
