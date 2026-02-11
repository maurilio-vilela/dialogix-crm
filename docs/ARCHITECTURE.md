# Arquitetura do Sistema - Dialogix CRM

## 📐 Visão Geral da Arquitetura

O Dialogix CRM utiliza uma arquitetura moderna baseada em **microserviços monolítico modular** com separação clara entre frontend e backend, comunicação em tempo real via WebSockets, e processamento assíncrono com filas.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile Web  │  │   PWA App    │          │
│  │  (React)     │  │  (Responsive)│  │  (Offline)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / NGINX                           │
│                   (Reverse Proxy + SSL)                          │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                 ┌──────────────────┐
│   REST API       │◄────────────────┤  WebSocket       │
│   (HTTP/HTTPS)   │                 │  (Socket.io)     │
│   Port 3000      │                 │  Port 3001       │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
         └────────────────┬───────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                      (NestJS Backend)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Core Modules                          │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │   │
│  │  │  Auth  │ │ Users  │ │Tenants │ │Contacts│           │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Business Modules                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Attendance│ │ Pipeline │ │   AI     │ │  Tasks   │   │   │
│  │  │  (Chat)  │ │  (Sales) │ │ Agents   │ │          │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 Integration Modules                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │WhatsApp  │ │Instagram │ │ Telegram │ │  Email   │   │   │
│  │  │   API    │ │   API    │ │   API    │ │   SMTP   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   BullMQ     │
│  (Database)  │  │   (Cache)    │  │   (Queue)    │
│  Port 5432   │  │  Port 6379   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  OpenAI  │ │  Claude  │ │  Gemini  │ │   Grok   │          │
│  │   API    │ │   API    │ │   API    │ │   API    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Stripe  │ │   AWS    │ │  n8n     │ │ Shopify  │          │
│  │Payments  │ │   S3     │ │Webhooks  │ │   API    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Camadas da Aplicação

### 1. **Camada de Apresentação (Frontend)**

**Tecnologias**: React 18 + TypeScript + TailwindCSS

**Responsabilidades:**
- Interface do usuário (UI/UX)
- Gerenciamento de estado local (Zustand)
- Comunicação com API (Axios + React Query)
- WebSocket cliente (Socket.io-client)
- Validação de formulários (React Hook Form + Zod)
- Roteamento (React Router)

**Componentes Principais:**
```
src/
├── components/
│   ├── ui/              # Componentes base (Shadcn/ui)
│   ├── layout/          # Layout (Sidebar, Header, Footer)
│   ├── forms/           # Formulários reutilizáveis
│   └── shared/          # Componentes compartilhados
├── pages/               # Páginas da aplicação
├── services/            # Serviços de API
├── hooks/               # Custom React Hooks
├── store/               # Estado global (Zustand)
└── utils/               # Funções utilitárias
```

### 2. **Camada de API (Backend)**

**Tecnologias**: NestJS + TypeScript + TypeORM

**Responsabilidades:**
- Lógica de negócio
- Validação de dados
- Autenticação e autorização
- Integração com banco de dados
- Processamento de requisições HTTP
- Gerenciamento de WebSockets
- Filas de processamento

**Estrutura Modular:**
```
src/
├── modules/
│   ├── auth/           # Autenticação JWT
│   ├── tenants/        # Multi-tenancy
│   ├── users/          # Gestão de usuários
│   ├── contacts/       # Gestão de contatos
│   ├── conversations/  # Conversas
│   ├── messages/       # Mensagens
│   ├── channels/       # Canais de comunicação
│   ├── pipelines/      # Pipeline de vendas
│   ├── deals/          # Oportunidades
│   ├── tasks/          # Tarefas
│   ├── ai-agents/      # Agentes de IA
│   └── analytics/      # Analytics e relatórios
├── common/             # Código compartilhado
├── config/             # Configurações
└── database/           # Migrations e seeds
```

### 3. **Camada de Dados**

**Tecnologias**: PostgreSQL + TypeORM + Redis

**Responsabilidades:**
- Persistência de dados (PostgreSQL)
- Cache de dados (Redis)
- Gerenciamento de sessões (Redis)
- Filas de processamento (BullMQ + Redis)

---

## 🔐 Segurança e Autenticação

### Multi-Tenancy (Isolamento de Dados)

```typescript
// Cada requisição carrega o tenant_id
interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    tenant_id: string; // Identificador da empresa
    role: 'admin' | 'manager' | 'agent';
  };
}

// Todas as queries incluem tenant_id automaticamente
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenant_id;
    
    // Injeta tenant_id em todas as queries
    request.tenantId = tenantId;
    return next.handle();
  }
}
```

### Autenticação JWT

```typescript
// Login flow
1. User → POST /auth/login { email, password }
2. Backend valida credenciais
3. Backend gera JWT token com payload:
   {
     sub: user.id,
     email: user.email,
     tenant_id: user.tenant_id,
     role: user.role,
     exp: 7d
   }
4. Frontend armazena token em localStorage
5. Todas requisições incluem: Authorization: Bearer <token>
```

### Permissões (RBAC - Role-Based Access Control)

```typescript
enum Role {
  SUPER_ADMIN = 'super_admin',  // Acesso total ao sistema
  ADMIN = 'admin',               // Administrador da empresa
  MANAGER = 'manager',           // Gerente de equipe
  AGENT = 'agent',               // Atendente
  VIEWER = 'viewer'              // Apenas visualização
}

// Exemplo de proteção de rota
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Post('users')
async createUser(@Body() dto: CreateUserDto) {
  // Apenas ADMIN e MANAGER podem criar usuários
}
```

---

## 📡 Comunicação em Tempo Real

### WebSocket Architecture (Socket.io)

```typescript
// Namespaces para organização
/chat          // Chat entre atendentes e clientes
/internal-chat // Chat interno da equipe
/notifications // Notificações em tempo real
/presence      // Status online/offline

// Rooms (isolamento por tenant)
socket.join(`tenant:${tenantId}`);
socket.join(`user:${userId}`);
socket.join(`conversation:${conversationId}`);

// Eventos principais
socket.on('message:send', handleSendMessage);
socket.on('message:read', handleMarkAsRead);
socket.on('typing:start', handleTypingStart);
socket.on('typing:stop', handleTypingStop);
```

### Fluxo de Mensagem em Tempo Real

```
1. Cliente envia mensagem via Socket.io
   ↓
2. Backend recebe e valida
   ↓
3. Salva no PostgreSQL
   ↓
4. Emite evento para todos na room (tenant + conversation)
   ↓
5. Atualiza cache Redis (últimas mensagens)
   ↓
6. Envia notificação push (se usuário offline)
   ↓
7. Integração externa (WhatsApp/Instagram/etc)
```

---

## ⚡ Processamento Assíncrono

### BullMQ Queues

```typescript
// Filas principais
- message-queue        // Envio de mensagens externas
- ai-processing-queue  // Processamento com IA
- notification-queue   // Envio de notificações
- webhook-queue        // Disparo de webhooks
- report-queue         // Geração de relatórios
- email-queue          // Envio de e-mails
```

### Exemplo de Worker

```typescript
@Processor('message-queue')
export class MessageProcessor {
  @Process('send-whatsapp')
  async sendWhatsApp(job: Job) {
    const { message, contactPhone, channelId } = job.data;
    
    // 1. Buscar credenciais do canal
    const channel = await this.channelsService.findOne(channelId);
    
    // 2. Enviar via Evolution API
    await this.whatsappService.sendMessage(
      channel.credentials,
      contactPhone,
      message
    );
    
    // 3. Atualizar status da mensagem
    await this.messagesService.updateStatus(
      job.data.messageId,
      'sent'
    );
  }
}
```

---

## 🧩 Integrações Externas

### WhatsApp (Evolution API)

```typescript
// Fluxo de integração
1. Admin configura canal no sistema
2. QR Code gerado via Evolution API
3. Admin escaneia QR Code no WhatsApp
4. Webhook recebe eventos de mensagens
5. Sistema processa e exibe no chat
```

### Instagram (Meta Graph API)

```typescript
// Fluxo OAuth
1. Admin clica em "Conectar Instagram"
2. Redirect para Facebook OAuth
3. Callback recebe access_token
4. Sistema salva token e configura webhook
5. Mensagens chegam via webhook
```

### AI Agents (OpenAI, Claude, Gemini, Grok)

```typescript
// Configuração de agente
{
  name: 'Atendente Virtual',
  model: 'gpt-4',
  temperature: 0.7,
  systemPrompt: 'Você é um atendente...',
  enabled: true,
  triggerOnNewConversation: true,
  handoffToHumanKeywords: ['falar com humano', 'atendente']
}

// Fluxo de processamento
1. Nova mensagem chega
2. Se agente ativo → envia para fila AI
3. Worker processa com LLM
4. Resposta gerada é enviada
5. Se handoff detectado → transfere para humano
```

---

## 📊 Estratégias de Cache

### Redis Cache Layers

```typescript
// Layer 1: User sessions (TTL: 7 dias)
`session:${userId}` → { user_data, permissions, tenant_info }

// Layer 2: Conversations cache (TTL: 1 hora)
`conversations:${tenantId}:active` → [conversation_ids]
`conversation:${conversationId}:messages` → [last_50_messages]

// Layer 3: Quick replies cache (TTL: 24 horas)
`quick_replies:${tenantId}` → [quick_reply_templates]

// Layer 4: Dashboard metrics (TTL: 5 minutos)
`metrics:${tenantId}:dashboard` → { kpi_data }
```

### Cache Invalidation Strategy

```typescript
// Event-based invalidation
onNewMessage → invalidate conversation cache
onUserUpdate → invalidate user session
onQuickReplyUpdate → invalidate quick_replies cache
```

---

## 🚀 Escalabilidade

### Horizontal Scaling

```
┌──────────────┐
│  Load        │
│  Balancer    │
│  (Nginx)     │
└──────┬───────┘
       │
   ┌───┴────┬────────┬────────┐
   │        │        │        │
   ▼        ▼        ▼        ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│API 1│  │API 2│  │API 3│  │API 4│
└─────┘  └─────┘  └─────┘  └─────┘
   │        │        │        │
   └────────┴────────┴────────┘
            │
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │  (Primary)   │
    │      +       │
    │  Read        │
    │  Replicas    │
    └──────────────┘
```

### Otimizações de Performance

1. **Database Indexing**
```sql
-- Índices essenciais
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_contacts_tenant_email ON contacts(tenant_id, email);
```

2. **Query Optimization**
```typescript
// Pagination com cursor
async findMessages(conversationId: string, cursor?: string, limit = 50) {
  return this.messagesRepository.find({
    where: {
      conversation_id: conversationId,
      ...(cursor && { created_at: LessThan(cursor) })
    },
    order: { created_at: 'DESC' },
    take: limit
  });
}
```

3. **Lazy Loading**
```typescript
// Carregar conversas sem mensagens
// Carregar mensagens sob demanda
// Carregar mídias com lazy loading
```

---

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Run tests
      - Build backend
      - Build frontend
      - Deploy to VPS via SSH
      - Run migrations
      - Restart PM2 processes
      - Health check
```

---

## 📈 Monitoramento

### Métricas Essenciais

```typescript
// System Health
- API Response Time (< 200ms p95)
- WebSocket Latency (< 50ms)
- Database Query Time (< 100ms)
- Queue Processing Rate (messages/sec)
- Error Rate (< 0.1%)

// Business Metrics
- Active Conversations
- Messages Sent/Received (per hour)
- AI Agent Response Time
- User Activity (DAU/MAU)
- Conversion Rate
```

### Alertas

```typescript
// Critical alerts
- API Down (5xx errors > 5%)
- Database Connection Lost
- Redis Connection Lost
- Queue Backup (>1000 pending jobs)
- Disk Space < 10%
```

---

## 🔒 Backup e Disaster Recovery

### Backup Strategy

```bash
# PostgreSQL - Daily automated backup
0 2 * * * pg_dump dialogix_crm | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload para S3
aws s3 cp backup_*.sql.gz s3://dialogix-backups/

# Retention: 7 daily, 4 weekly, 12 monthly
```

### Recovery Plan

```bash
# 1. Restore database
gunzip -c backup_20250211.sql.gz | psql dialogix_crm

# 2. Restart services
pm2 restart all

# 3. Verify integrity
curl http://localhost:3000/health
```

---

## 📚 Próximos Passos

Consulte os documentos adicionais:
- [DATABASE.md](DATABASE.md) - Modelagem completa
- [API.md](API.md) - Endpoints documentados
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy na VPS

---

**Última Atualização**: 11 de Fevereiro de 2025
