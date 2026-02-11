# Modelagem de Banco de Dados - Dialogix CRM

## 🗄️ Visão Geral

O Dialogix CRM utiliza **PostgreSQL 15+** como banco de dados principal, implementando uma arquitetura **multi-tenant** com isolamento de dados por `tenant_id`.

### Princípios da Modelagem

- ✅ **Multi-tenancy**: Todas as tabelas principais incluem `tenant_id`
- ✅ **Soft Delete**: Uso de `deleted_at` para exclusão lógica
- ✅ **Timestamps**: `created_at` e `updated_at` em todas as tabelas
- ✅ **UUIDs**: Uso de UUID v4 para chaves primárias
- ✅ **Indexação**: Índices em colunas frequentemente consultadas
- ✅ **Relacionamentos**: Foreign keys com CASCADE apropriado
- ✅ **Normalização**: 3ª Forma Normal (3NF)

---

## 📊 Diagrama ER (Entity Relationship)

```
┌─────────────┐
│   TENANTS   │
│  (Empresas) │
└──────┬──────┘
       │ 1:N
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  USERS   │   │ CONTACTS │   │ CHANNELS │   │PIPELINES │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │ 1:N          │ 1:N          │ 1:N          │ 1:N
     │              │              │              │
     ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  TASKS   │   │CONVERSA- │   │MESSAGES  │   │  DEALS   │
│          │   │  TIONS   │   │          │   │          │
└──────────┘   └────┬─────┘   └──────────┘   └──────────┘
                    │ 1:N
                    ▼
               ┌──────────┐
               │ MESSAGES │
               └──────────┘
```

---

## 📋 Tabelas do Sistema

### 1. **tenants** (Empresas/Clientes SaaS)

Armazena informações das empresas que usam o sistema (multi-tenancy).

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações básicas
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- dialogix-tech
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Customização
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#6366f1', -- #RRGGBB
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  
  -- Configurações
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(5) DEFAULT 'pt-BR',
  
  -- Status e limites
  status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled
  subscription_plan VARCHAR(50) DEFAULT 'starter', -- starter, professional, enterprise
  max_users INTEGER DEFAULT 5,
  max_contacts INTEGER DEFAULT 1000,
  max_channels INTEGER DEFAULT 3,
  
  -- Faturamento
  billing_email VARCHAR(255),
  billing_day INTEGER DEFAULT 1, -- Dia do mês para cobrança
  
  -- Trial e ativação
  trial_ends_at TIMESTAMP,
  activated_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_email ON tenants(email);
```

---

### 2. **users** (Usuários do Sistema)

Armazena informações dos usuários que trabalham no CRM.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Informações pessoais
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Autenticação
  password_hash VARCHAR(255) NOT NULL,
  
  -- Permissões
  role VARCHAR(50) DEFAULT 'agent', -- admin, manager, agent, viewer
  
  -- Configurações pessoais
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(5) DEFAULT 'pt-BR',
  theme VARCHAR(10) DEFAULT 'light', -- light, dark, auto
  
  -- Notificações
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sound_notifications BOOLEAN DEFAULT TRUE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT uk_users_tenant_email UNIQUE (tenant_id, email)
);

-- Índices
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

---

### 3. **contacts** (Contatos/Leads/Clientes)

Armazena informações dos contatos (leads, prospects, clientes).

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Informações básicas
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  
  -- Informações adicionais
  company VARCHAR(255),
  position VARCHAR(100),
  
  -- Endereço
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_zip VARCHAR(20),
  address_country VARCHAR(50) DEFAULT 'Brasil',
  
  -- Redes sociais
  instagram_username VARCHAR(100),
  telegram_username VARCHAR(100),
  facebook_id VARCHAR(100),
  
  -- Metadados
  source VARCHAR(50), -- whatsapp, instagram, telegram, email, manual, api
  custom_fields JSONB DEFAULT '{}', -- Campos personalizados
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, blocked, archived
  
  -- Atribuição
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT uk_contacts_tenant_phone UNIQUE (tenant_id, phone)
);

-- Índices
CREATE INDEX idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_assigned_user ON contacts(assigned_user_id);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_source ON contacts(source);
```

---

### 4. **tags** (Etiquetas)

Tags para organização de contatos, conversas e deals.

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1', -- #RRGGBB
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_tags_tenant_name UNIQUE (tenant_id, name)
);

-- Índices
CREATE INDEX idx_tags_tenant ON tags(tenant_id);
```

---

### 5. **contact_tags** (Relacionamento Contatos-Tags)

```sql
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_contact_tags UNIQUE (contact_id, tag_id)
);

-- Índices
CREATE INDEX idx_contact_tags_contact ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag ON contact_tags(tag_id);
```

---

### 6. **channels** (Canais de Comunicação)

Configurações de canais de atendimento (WhatsApp, Instagram, Telegram, Email).

```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Informações do canal
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- whatsapp, instagram, telegram, email
  
  -- Configurações e credenciais (criptografadas)
  credentials JSONB NOT NULL DEFAULT '{}', -- API keys, tokens, etc
  settings JSONB DEFAULT '{}', -- Configurações específicas do canal
  
  -- Status
  status VARCHAR(20) DEFAULT 'disconnected', -- connected, disconnected, error
  connection_status JSONB, -- Detalhes da conexão
  
  -- Atribuição
  default_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  default_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Timestamps
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_channels_tenant ON channels(tenant_id);
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_channels_status ON channels(status);
```

---

### 7. **departments** (Setores)

Setores/departamentos para organização da equipe.

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configurações de distribuição
  distribution_mode VARCHAR(50) DEFAULT 'round_robin', -- round_robin, random, least_busy
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_departments_tenant ON departments(tenant_id);
```

---

### 8. **department_users** (Relacionamento Setores-Usuários)

```sql
CREATE TABLE department_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  is_manager BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT uk_department_users UNIQUE (department_id, user_id)
);

-- Índices
CREATE INDEX idx_department_users_department ON department_users(department_id);
CREATE INDEX idx_department_users_user ON department_users(user_id);
```

---

### 9. **conversations** (Conversas/Atendimentos)

Conversas entre atendentes e contatos.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Status da conversa
  status VARCHAR(20) DEFAULT 'open', -- open, pending, resolved, closed
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Protocolo de atendimento
  protocol VARCHAR(50) UNIQUE,
  
  -- Métricas
  first_response_time INTEGER, -- segundos até primeira resposta
  resolution_time INTEGER, -- segundos até resolução
  messages_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  
  -- Avaliação
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  rating_comment TEXT,
  rated_at TIMESTAMP,
  
  -- Notas internas
  internal_notes TEXT,
  
  -- Última mensagem (desnormalização para performance)
  last_message_at TIMESTAMP,
  last_message_preview TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_channel ON conversations(channel_id);
CREATE INDEX idx_conversations_assigned_user ON conversations(assigned_user_id);
CREATE INDEX idx_conversations_department ON conversations(department_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);
```

---

### 10. **messages** (Mensagens)

Mensagens trocadas nas conversas.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Direção da mensagem
  direction VARCHAR(20) NOT NULL, -- inbound (recebida), outbound (enviada)
  
  -- Remetente
  sender_type VARCHAR(20) NOT NULL, -- contact, user, bot
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Conteúdo
  content_type VARCHAR(50) DEFAULT 'text', -- text, image, video, audio, document, location
  content TEXT,
  
  -- Mídia
  media_url TEXT,
  media_type VARCHAR(50), -- image/jpeg, video/mp4, audio/ogg, application/pdf
  media_size INTEGER, -- bytes
  media_duration INTEGER, -- segundos (para áudio/vídeo)
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, read, failed
  error_message TEXT,
  
  -- IDs externos (das plataformas)
  external_id VARCHAR(255), -- ID da mensagem no WhatsApp/Instagram/etc
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_messages_tenant ON messages(tenant_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_contact ON messages(contact_id);
CREATE INDEX idx_messages_sender_user ON messages(sender_user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);
```

---

### 11. **quick_replies** (Respostas Rápidas)

Templates de respostas rápidas.

```sql
CREATE TABLE quick_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Identificação
  shortcut VARCHAR(50) NOT NULL, -- /bom-dia, /horario, etc
  title VARCHAR(255) NOT NULL,
  
  -- Conteúdo
  content TEXT NOT NULL,
  
  -- Mídia anexa (opcional)
  media_url TEXT,
  media_type VARCHAR(50),
  
  -- Organização
  category VARCHAR(100), -- saudacao, informacao, despedida, etc
  
  -- Uso
  usage_count INTEGER DEFAULT 0,
  
  -- Criador
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT uk_quick_replies_tenant_shortcut UNIQUE (tenant_id, shortcut)
);

-- Índices
CREATE INDEX idx_quick_replies_tenant ON quick_replies(tenant_id);
CREATE INDEX idx_quick_replies_shortcut ON quick_replies(shortcut);
CREATE INDEX idx_quick_replies_category ON quick_replies(category);
```

---

### 12. **pipelines** (Funis de Vendas)

Pipelines personalizados de vendas.

```sql
CREATE TABLE pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configurações
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Ordem
  position INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_pipelines_tenant ON pipelines(tenant_id);
CREATE INDEX idx_pipelines_position ON pipelines(position);
```

---

### 13. **pipeline_stages** (Etapas do Funil)

Etapas de cada pipeline.

```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  
  -- Ordem
  position INTEGER DEFAULT 0,
  
  -- Probabilidade de fechamento (%)
  win_probability INTEGER DEFAULT 0 CHECK (win_probability >= 0 AND win_probability <= 100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX idx_pipeline_stages_position ON pipeline_stages(position);
```

---

### 14. **deals** (Oportunidades)

Oportunidades de vendas.

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Informações do deal
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Valores
  value DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Datas
  expected_close_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'open', -- open, won, lost
  lost_reason TEXT,
  
  -- Timestamps
  won_at TIMESTAMP,
  lost_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_deals_tenant ON deals(tenant_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX idx_deals_stage ON deals(stage_id);
CREATE INDEX idx_deals_assigned_user ON deals(assigned_user_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);
```

---

### 15. **deal_activities** (Histórico de Movimentações)

Histórico de movimentações dos deals no funil.

```sql
CREATE TABLE deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  
  -- Tipo de atividade
  activity_type VARCHAR(50) NOT NULL, -- created, stage_changed, value_changed, assigned, won, lost
  
  -- Dados antigos e novos (para auditoria)
  old_value JSONB,
  new_value JSONB,
  
  -- Quem fez a mudança
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_deal_activities_deal ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_type ON deal_activities(activity_type);
CREATE INDEX idx_deal_activities_created_at ON deal_activities(created_at DESC);
```

---

### 16. **tasks** (Tarefas)

Gestão de tarefas da equipe.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Informações da tarefa
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Tipo
  task_type VARCHAR(50) DEFAULT 'call', -- call, email, meeting, follow_up, other
  
  -- Prioridade
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  -- Datas
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_tasks_contact ON tasks(contact_id);
CREATE INDEX idx_tasks_deal ON tasks(deal_id);
CREATE INDEX idx_tasks_assigned_user ON tasks(assigned_user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

---

### 17. **scheduled_messages** (Mensagens Agendadas)

Mensagens agendadas para envio futuro.

```sql
CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Relacionamentos
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  content TEXT NOT NULL,
  media_url TEXT,
  
  -- Agendamento
  scheduled_at TIMESTAMP NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, cancelled
  sent_at TIMESTAMP,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_scheduled_messages_tenant ON scheduled_messages(tenant_id);
CREATE INDEX idx_scheduled_messages_contact ON scheduled_messages(contact_id);
CREATE INDEX idx_scheduled_messages_status ON scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_at ON scheduled_messages(scheduled_at);
```

---

### 18. **follow_up_flows** (Fluxos de Follow-up)

Configuração de fluxos de follow-up automático.

```sql
CREATE TABLE follow_up_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Configurações
  trigger_on VARCHAR(50) DEFAULT 'manual', -- manual, no_response, conversation_closed
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_follow_up_flows_tenant ON follow_up_flows(tenant_id);
CREATE INDEX idx_follow_up_flows_active ON follow_up_flows(is_active);
```

---

### 19. **follow_up_steps** (Etapas do Follow-up)

Etapas de cada fluxo de follow-up.

```sql
CREATE TABLE follow_up_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID NOT NULL REFERENCES follow_up_flows(id) ON DELETE CASCADE,
  
  -- Ordem
  step_number INTEGER NOT NULL,
  
  -- Conteúdo
  message TEXT NOT NULL,
  media_url TEXT,
  
  -- Timing
  delay_minutes INTEGER NOT NULL, -- Minutos de espera desde a etapa anterior
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_follow_up_steps_flow ON follow_up_steps(flow_id);
CREATE INDEX idx_follow_up_steps_step_number ON follow_up_steps(step_number);
```

---

### 20. **ai_agents** (Agentes de IA)

Configuração de agentes de IA.

```sql
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Modelo de IA
  provider VARCHAR(50) NOT NULL, -- openai, anthropic, google, xai
  model VARCHAR(100) NOT NULL, -- gpt-4, claude-3, gemini-pro, grok-1
  
  -- Configurações do modelo
  temperature DECIMAL(2, 1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 1000,
  
  -- Prompts
  system_prompt TEXT NOT NULL,
  welcome_message TEXT,
  
  -- Comportamento
  trigger_on_new_conversation BOOLEAN DEFAULT FALSE,
  trigger_keywords TEXT[], -- Array de palavras-chave
  handoff_keywords TEXT[], -- Palavras que acionam transferência para humano
  
  -- Integração
  assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  handoff_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Base de conhecimento
  knowledge_base TEXT, -- Texto ou URL para embeddings
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métricas
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_ai_agents_tenant ON ai_agents(tenant_id);
CREATE INDEX idx_ai_agents_active ON ai_agents(is_active);
CREATE INDEX idx_ai_agents_department ON ai_agents(assigned_department_id);
```

---

### 21. **webhooks** (Webhooks)

Configuração de webhooks personalizados.

```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  
  -- Eventos que disparam o webhook
  events TEXT[] NOT NULL, -- ['message.received', 'conversation.closed', 'deal.won']
  
  -- Autenticação
  secret_token VARCHAR(255), -- Para validação de requisições
  
  -- Headers customizados
  custom_headers JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Métricas
  total_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  last_called_at TIMESTAMP,
  last_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

-- Índices
CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

---

### 22. **webhook_logs** (Logs de Webhooks)

Logs de requisições de webhooks (retenção: 30 dias).

```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Requisição
  event VARCHAR(100) NOT NULL,
  payload JSONB,
  
  -- Resposta
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Erro (se houver)
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);
```

---

### 23. **subscriptions** (Assinaturas SaaS)

Gestão de assinaturas dos tenants.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Plano
  plan VARCHAR(50) NOT NULL, -- starter, professional, enterprise
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, suspended, past_due
  
  -- Valores
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  
  -- Datas
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP,
  
  -- Gateway de pagamento
  payment_gateway VARCHAR(50), -- stripe, mercadopago, asaas
  gateway_subscription_id VARCHAR(255), -- ID no gateway
  
  -- Trial
  trial_start DATE,
  trial_end DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
```

---

### 24. **payments** (Pagamentos)

Histórico de pagamentos.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Valor
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
  
  -- Gateway
  payment_gateway VARCHAR(50) NOT NULL,
  gateway_payment_id VARCHAR(255),
  gateway_charge_id VARCHAR(255),
  
  -- Método de pagamento
  payment_method VARCHAR(50), -- credit_card, boleto, pix
  
  -- Datas
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  -- Nota fiscal
  invoice_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_subscription ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

---

### 25. **notifications** (Notificações)

Notificações do sistema.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo
  type VARCHAR(50) NOT NULL, -- message, task, deal, mention, system
  
  -- Conteúdo
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  -- Link
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

### 26. **internal_messages** (Chat Interno)

Mensagens do chat interno da equipe.

```sql
CREATE TABLE internal_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Remetente
  sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Destinatário (privado) ou nulo (canal geral)
  recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Conteúdo
  content TEXT NOT NULL,
  
  -- Mídia
  media_url TEXT,
  media_type VARCHAR(50),
  
  -- Status de leitura
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_internal_messages_tenant ON internal_messages(tenant_id);
CREATE INDEX idx_internal_messages_sender ON internal_messages(sender_user_id);
CREATE INDEX idx_internal_messages_recipient ON internal_messages(recipient_user_id);
CREATE INDEX idx_internal_messages_created_at ON internal_messages(created_at DESC);
```

---

## 🔧 Scripts Úteis

### Criação de Usuário Admin Inicial

```sql
-- Criar tenant
INSERT INTO tenants (name, slug, email, status, subscription_plan)
VALUES ('Dialogix Demo', 'dialogix-demo', 'admin@dialogix.com', 'trial', 'professional')
RETURNING id;

-- Criar usuário admin (use o tenant_id retornado acima)
INSERT INTO users (tenant_id, name, email, password_hash, role)
VALUES 
  ('TENANT_ID_HERE', 'Admin', 'admin@dialogix.com', '$2b$10$...', 'admin');
```

### Verificar Integridade dos Dados

```sql
-- Verificar conversas órfãs
SELECT COUNT(*) FROM conversations WHERE contact_id NOT IN (SELECT id FROM contacts);

-- Verificar mensagens órfãs
SELECT COUNT(*) FROM messages WHERE conversation_id NOT IN (SELECT id FROM conversations);

-- Verificar usuários sem tenant
SELECT COUNT(*) FROM users WHERE tenant_id NOT IN (SELECT id FROM tenants);
```

---

## 📚 Próximos Passos

- [API.md](API.md) - Documentação de endpoints
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy na VPS
- [DEVELOPMENT.md](DEVELOPMENT.md) - Guia de desenvolvimento

---

**Última Atualização**: 11 de Fevereiro de 2025
