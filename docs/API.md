# Documentação de API - Dialogix CRM

## 🚀 Visão Geral

A API do Dialogix CRM é uma RESTful API construída com NestJS, seguindo os padrões REST e utilizando JSON para troca de dados.

### Base URL

```
Desenvolvimento: http://localhost:3000/api/v1
Produção: https://api.dialogix.com/v1
```

### Autenticação

Todas as requisições (exceto login e registro) requerem autenticação via **JWT Bearer Token**.

```http
Authorization: Bearer <your_jwt_token>
```

### Formato de Resposta

#### Sucesso

```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

#### Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [...]
  }
}
```

### Paginação

Endpoints que retornam listas suportam paginação:

```
GET /api/v1/contacts?page=1&limit=20&sort=created_at&order=DESC
```

**Resposta:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🔐 Autenticação

### POST /auth/register

Registrar novo tenant e usuário admin.

**Request Body:**
```json
{
  "tenant": {
    "name": "Minha Empresa",
    "email": "contato@empresa.com",
    "phone": "(11) 99999-9999"
  },
  "user": {
    "name": "João Silva",
    "email": "joao@empresa.com",
    "password": "SenhaSegura123!",
    "phone": "(11) 98888-8888"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Minha Empresa",
      "slug": "minha-empresa",
      "status": "trial"
    },
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "admin"
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 604800
    }
  }
}
```

---

### POST /auth/login

Login de usuário.

**Request Body:**
```json
{
  "email": "joao@empresa.com",
  "password": "SenhaSegura123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "admin",
      "tenant": {
        "id": "uuid",
        "name": "Minha Empresa",
        "logo_url": "https://..."
      }
    },
    "tokens": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token",
      "expires_in": 604800
    }
  }
}
```

---

### POST /auth/refresh

Renovar token de acesso.

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token",
    "refresh_token": "new_refresh_token",
    "expires_in": 604800
  }
}
```

---

### POST /auth/logout

Logout do usuário.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 👥 Usuários

### GET /users

Listar usuários do tenant.

**Query Parameters:**
- `page` (number): Número da página
- `limit` (number): Itens por página
- `search` (string): Busca por nome ou email
- `role` (string): Filtrar por role (admin, manager, agent)
- `status` (string): Filtrar por status (active, inactive)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "role": "admin",
      "status": "active",
      "avatar_url": "https://...",
      "is_online": true,
      "last_seen_at": "2025-02-11T10:30:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /users/:id

Obter detalhes de um usuário.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "(11) 98888-8888",
    "role": "admin",
    "status": "active",
    "avatar_url": "https://...",
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "theme": "dark",
    "email_notifications": true,
    "push_notifications": true,
    "sound_notifications": true,
    "is_online": true,
    "last_seen_at": "2025-02-11T10:30:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "departments": [
      {
        "id": "uuid",
        "name": "Vendas",
        "is_manager": true
      }
    ]
  }
}
```

---

### POST /users

Criar novo usuário.

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@empresa.com",
  "password": "SenhaSegura123!",
  "phone": "(11) 97777-7777",
  "role": "agent",
  "department_ids": ["uuid1", "uuid2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "role": "agent",
    "status": "active"
  }
}
```

---

### PATCH /users/:id

Atualizar usuário.

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "phone": "(11) 96666-6666",
  "role": "manager",
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /users/:id

Remover usuário (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso"
}
```

---

## 📇 Contatos

### GET /contacts

Listar contatos.

**Query Parameters:**
- `page`, `limit`: Paginação
- `search`: Busca por nome, email ou telefone
- `status`: Filtrar por status (active, blocked, archived)
- `source`: Filtrar por origem (whatsapp, instagram, telegram, email)
- `assigned_user_id`: Filtrar por responsável
- `tag_ids`: Filtrar por tags (array)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Cliente Exemplo",
      "email": "cliente@email.com",
      "phone": "(11) 99999-9999",
      "avatar_url": "https://...",
      "company": "Empresa XYZ",
      "position": "Gerente",
      "source": "whatsapp",
      "status": "active",
      "assigned_user": {
        "id": "uuid",
        "name": "João Silva"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "VIP",
          "color": "#6366f1"
        }
      ],
      "created_at": "2025-02-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /contacts/:id

Obter visão 360º do contato.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Cliente Exemplo",
    "email": "cliente@email.com",
    "phone": "(11) 99999-9999",
    "avatar_url": "https://...",
    "company": "Empresa XYZ",
    "position": "Gerente",
    "address": {
      "street": "Rua Exemplo, 123",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01234-567",
      "country": "Brasil"
    },
    "social": {
      "instagram": "@cliente",
      "telegram": "@cliente",
      "facebook_id": "123456"
    },
    "source": "whatsapp",
    "status": "active",
    "custom_fields": { ... },
    "assigned_user": { ... },
    "tags": [ ... ],
    "stats": {
      "total_conversations": 15,
      "total_messages": 234,
      "total_deals": 3,
      "total_deal_value": 15000.00,
      "last_contact_at": "2025-02-11T09:00:00Z"
    },
    "recent_conversations": [ ... ],
    "recent_deals": [ ... ],
    "recent_tasks": [ ... ],
    "created_at": "2025-02-01T10:00:00Z"
  }
}
```

---

### POST /contacts

Criar novo contato.

**Request Body:**
```json
{
  "name": "Novo Cliente",
  "email": "novo@email.com",
  "phone": "(11) 98888-8888",
  "company": "Empresa ABC",
  "position": "CEO",
  "source": "manual",
  "assigned_user_id": "uuid",
  "tag_ids": ["uuid1", "uuid2"],
  "custom_fields": {
    "cpf": "123.456.789-00",
    "data_nascimento": "1990-01-01"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PATCH /contacts/:id

Atualizar contato.

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE /contacts/:id

Remover contato.

**Response (200):**
```json
{
  "success": true,
  "message": "Contato removido com sucesso"
}
```

---

## 📡 Canais (MVP Runtime)

> **Nota:** esta seção reflete o comportamento atual implementado no backend (`/api/v1/channels`).
> Os retornos deste módulo estão em formato direto (sem envelope `success/data`).

### GET /channels

Listar canais do tenant autenticado.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "tenantId": "uuid",
    "name": "WhatsApp Principal",
    "type": "whatsapp",
    "status": "connected",
    "phone_number": "+5511987654321",
    "phoneNumber": "+5511987654321",
    "is_default": true,
    "isDefault": true,
    "created_at": "2026-02-20T22:00:00.000Z",
    "createdAt": "2026-02-20T22:00:00.000Z",
    "updated_at": "2026-02-20T22:00:00.000Z",
    "updatedAt": "2026-02-20T22:00:00.000Z"
  }
]
```

---

### POST /channels

Criar canal no tenant autenticado.

**Request Body (mínimo):**
```json
{
  "name": "WhatsApp Comercial",
  "type": "whatsapp"
}
```

**Campos aceitos:**
- `name` (string, obrigatório)
- `type` (enum: `whatsapp|instagram|telegram|email|webchat`, obrigatório)
- `status` (enum: `connected|disconnected`, opcional)
- `phone_number` ou `phoneNumber` (string, opcional)
- `is_default` ou `isDefault` (boolean, opcional)

**Regra:** ao enviar `is_default=true`, os outros canais do mesmo tenant são desmarcados como padrão.

**Response (201):**
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "name": "WhatsApp Comercial",
  "type": "whatsapp",
  "status": "disconnected",
  "phone_number": null,
  "is_default": false,
  "created_at": "2026-02-20T22:00:00.000Z",
  "updated_at": "2026-02-20T22:00:00.000Z"
}
```

---

### PATCH /channels/:id

Atualizar canal do tenant autenticado.

**Request Body (exemplo):**
```json
{
  "status": "connected",
  "is_default": true
}
```

**Response (200):** objeto do canal atualizado (mesmo formato de `POST /channels`).

---

### DELETE /channels/:id

Remover canal (soft delete) no tenant autenticado.

**Response (200):**
```json
{
  "success": true,
  "message": "Canal removido com sucesso"
}
```

---

## 💬 Conversas

### GET /conversations

Listar conversas.

**Query Parameters (runtime atual):**
- `status`: open, pending, closed
- `assignedUserId`: Filtrar por responsável (UUID)
- `channelId`: Filtrar por canal (UUID)
- `channel`: Filtrar por tipo/nome do canal (ex.: `whatsapp`)
- `contactId`: Filtrar por contato (UUID)
- `search`: Buscar em nome do contato ou última mensagem

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "protocol": "ATD-2025-001234",
      "status": "open",
      "priority": "normal",
      "contact": {
        "id": "uuid",
        "name": "Cliente Exemplo",
        "avatar_url": "https://..."
      },
      "channel": {
        "id": "uuid",
        "name": "WhatsApp Principal",
        "type": "whatsapp"
      },
      "assigned_user": {
        "id": "uuid",
        "name": "João Silva",
        "avatar_url": "https://..."
      },
      "department": {
        "id": "uuid",
        "name": "Vendas"
      },
      "unread_count": 3,
      "messages_count": 45,
      "last_message": {
        "content": "Olá, preciso de ajuda...",
        "created_at": "2025-02-11T10:25:00Z"
      },
      "created_at": "2025-02-10T14:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /conversations/:id

Obter detalhes da conversa com mensagens.

**Query Parameters:**
- `messages_limit`: Limite de mensagens (padrão: 50)
- `messages_before`: Cursor para paginação de mensagens

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "protocol": "ATD-2025-001234",
    "status": "open",
    "priority": "normal",
    "contact": { ... },
    "channel": { ... },
    "assigned_user": { ... },
    "department": { ... },
    "rating": null,
    "rating_comment": null,
    "internal_notes": "Cliente VIP, dar atenção especial",
    "messages": [
      {
        "id": "uuid",
        "direction": "inbound",
        "sender_type": "contact",
        "content_type": "text",
        "content": "Olá, preciso de ajuda com meu pedido",
        "status": "read",
        "read_at": "2025-02-11T10:26:00Z",
        "created_at": "2025-02-11T10:25:00Z"
      },
      {
        "id": "uuid",
        "direction": "outbound",
        "sender_type": "user",
        "sender_user": {
          "id": "uuid",
          "name": "João Silva"
        },
        "content_type": "text",
        "content": "Olá! Claro, vou te ajudar. Qual o número do seu pedido?",
        "status": "delivered",
        "created_at": "2025-02-11T10:26:00Z"
      }
    ],
    "files": [
      {
        "id": "uuid",
        "message_id": "uuid",
        "media_type": "image/jpeg",
        "media_url": "https://...",
        "media_size": 245678,
        "created_at": "2025-02-11T09:00:00Z"
      }
    ],
    "created_at": "2025-02-10T14:00:00Z"
  }
}
```

---

### POST /conversations

Criar nova conversa.

**Request Body (runtime atual):**
```json
{
  "contactId": "uuid",
  "channelId": "uuid",
  "channel": "whatsapp",
  "assignedUserId": "uuid"
}
```

- `contactId` é obrigatório.
- `channelId` é opcional.
- `channel` é opcional (tipo/nome, ex.: `whatsapp`).
- Se `channelId` e `channel` não forem enviados, o backend usa canal padrão (`is_default=true`) do tenant; se não houver, tenta o primeiro canal disponível.

**Response (201):** objeto da conversa criado (resposta direta, sem envelope `success/data`).

---

### PATCH /conversations/:id

Atualizar conversa.

**Request Body (runtime atual):**
```json
{
  "status": "closed",
  "assignedUserId": "uuid"
}
```

**Response (200):** objeto da conversa atualizado (resposta direta, sem envelope `success/data`).

---

### POST /conversations/:id/transfer

Transferir conversa.

**Request Body:**
```json
{
  "transfer_type": "user", // user, department, channel
  "target_user_id": "uuid",
  "target_department_id": "uuid",
  "target_channel_id": "uuid",
  "note": "Transferindo para especialista"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversa transferida com sucesso"
}
```

---

### POST /conversations/:id/rate

Avaliar atendimento.

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Excelente atendimento!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avaliação registrada com sucesso"
}
```

---

## 📨 Mensagens

### GET /messages

Buscar mensagens (com filtros avançados).

**Query Parameters:**
- `conversation_id`: Filtrar por conversa
- `contact_id`: Filtrar por contato
- `search`: Buscar no conteúdo
- `date_from`: Data inicial
- `date_to`: Data final
- `content_type`: text, image, video, audio, document

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### POST /messages

Enviar mensagem.

**Request Body:**
```json
{
  "conversation_id": "uuid",
  "content_type": "text",
  "content": "Olá! Como posso ajudar?"
}
```

**Para enviar mídia:**
```json
{
  "conversation_id": "uuid",
  "content_type": "image",
  "content": "Segue a imagem solicitada",
  "media_url": "https://...",
  "media_type": "image/jpeg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "conversation_id": "uuid",
    "direction": "outbound",
    "content": "Olá! Como posso ajudar?",
    "status": "pending",
    "created_at": "2025-02-11T10:30:00Z"
  }
}
```

---

### POST /messages/upload

Upload de arquivo/mídia.

**Request (multipart/form-data):**
```
file: <binary>
conversation_id: uuid
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "media_url": "https://...",
    "media_type": "image/jpeg",
    "media_size": 245678,
    "media_duration": null
  }
}
```

---

### PATCH /messages/:id/status

Atualizar status da mensagem (marcar como lida).

**Request Body:**
```json
{
  "status": "read"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status atualizado"
}
```

---

## 🏷️ Tags

### GET /tags

Listar tags.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "VIP",
      "color": "#6366f1",
      "description": "Clientes VIP",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /tags

Criar tag.

**Request Body:**
```json
{
  "name": "Urgente",
  "color": "#ef4444",
  "description": "Atendimentos urgentes"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## ⚡ Respostas Rápidas

### GET /quick-replies

Listar respostas rápidas.

**Query Parameters:**
- `search`: Buscar por título ou atalho
- `category`: Filtrar por categoria

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "shortcut": "/horario",
      "title": "Horário de Atendimento",
      "content": "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.",
      "category": "informacao",
      "usage_count": 245,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /quick-replies

Criar resposta rápida.

**Request Body:**
```json
{
  "shortcut": "/endereco",
  "title": "Endereço da Loja",
  "content": "Estamos localizados na Rua Exemplo, 123 - São Paulo/SP",
  "category": "informacao",
  "media_url": "https://...",
  "media_type": "image/jpeg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 📊 Pipeline de Vendas

### GET /pipelines

Listar pipelines.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Vendas Principal",
      "description": "Pipeline principal de vendas",
      "is_default": true,
      "stages": [
        {
          "id": "uuid",
          "name": "Qualificação",
          "color": "#6366f1",
          "position": 0,
          "win_probability": 10,
          "deals_count": 15,
          "deals_value": 45000.00
        },
        {
          "id": "uuid",
          "name": "Proposta",
          "color": "#8b5cf6",
          "position": 1,
          "win_probability": 40,
          "deals_count": 8,
          "deals_value": 120000.00
        }
      ],
      "total_deals": 23,
      "total_value": 165000.00,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET /pipelines/:id

Obter pipeline com deals (visão Kanban).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vendas Principal",
    "stages": [
      {
        "id": "uuid",
        "name": "Qualificação",
        "deals": [
          {
            "id": "uuid",
            "title": "Venda Empresa XYZ",
            "value": 15000.00,
            "contact": {
              "id": "uuid",
              "name": "Cliente Exemplo"
            },
            "assigned_user": {
              "id": "uuid",
              "name": "João Silva"
            },
            "expected_close_date": "2025-03-15",
            "created_at": "2025-02-01T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

---

### POST /pipelines

Criar pipeline.

**Request Body:**
```json
{
  "name": "Pipeline Consultoria",
  "description": "Pipeline para vendas de consultoria",
  "stages": [
    {
      "name": "Contato Inicial",
      "color": "#6366f1",
      "win_probability": 5
    },
    {
      "name": "Reunião",
      "color": "#8b5cf6",
      "win_probability": 20
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 💼 Oportunidades (Deals)

### GET /deals

Listar oportunidades.

**Query Parameters:**
- `pipeline_id`: Filtrar por pipeline
- `stage_id`: Filtrar por etapa
- `assigned_user_id`: Filtrar por responsável
- `status`: open, won, lost
- `date_from`, `date_to`: Filtrar por período

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

---

### GET /deals/:id

Obter detalhes da oportunidade.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Venda Empresa XYZ",
    "description": "Venda de software de gestão",
    "value": 15000.00,
    "currency": "BRL",
    "status": "open",
    "contact": { ... },
    "pipeline": { ... },
    "stage": { ... },
    "assigned_user": { ... },
    "expected_close_date": "2025-03-15",
    "activities": [
      {
        "id": "uuid",
        "activity_type": "stage_changed",
        "old_value": { "stage_name": "Qualificação" },
        "new_value": { "stage_name": "Proposta" },
        "user": { ... },
        "created_at": "2025-02-10T15:00:00Z"
      }
    ],
    "created_at": "2025-02-01T10:00:00Z"
  }
}
```

---

### POST /deals

Criar oportunidade.

**Request Body:**
```json
{
  "contact_id": "uuid",
  "pipeline_id": "uuid",
  "stage_id": "uuid",
  "assigned_user_id": "uuid",
  "title": "Nova Venda",
  "description": "Descrição da oportunidade",
  "value": 25000.00,
  "expected_close_date": "2025-04-30"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PATCH /deals/:id/stage

Mover deal para outra etapa.

**Request Body:**
```json
{
  "stage_id": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Deal movido com sucesso"
}
```

---

### PATCH /deals/:id/status

Marcar deal como ganho ou perdido.

**Request Body:**
```json
{
  "status": "won" // ou "lost"
  "lost_reason": "Preço muito alto" // apenas se lost
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Deal atualizado com sucesso"
}
```

---

## ✅ Tarefas

### GET /tasks

Listar tarefas.

**Query Parameters:**
- `assigned_user_id`: Filtrar por responsável
- `status`: pending, in_progress, completed
- `priority`: low, normal, high, urgent
- `task_type`: call, email, meeting, follow_up
- `date_from`, `date_to`: Filtrar por vencimento

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Ligar para cliente XYZ",
      "description": "Confirmar reunião",
      "task_type": "call",
      "priority": "high",
      "status": "pending",
      "contact": { ... },
      "deal": { ... },
      "assigned_user": { ... },
      "due_date": "2025-02-12T14:00:00Z",
      "created_at": "2025-02-11T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### POST /tasks

Criar tarefa.

**Request Body:**
```json
{
  "title": "Enviar proposta",
  "description": "Enviar proposta comercial para o cliente",
  "task_type": "email",
  "priority": "normal",
  "contact_id": "uuid",
  "deal_id": "uuid",
  "assigned_user_id": "uuid",
  "due_date": "2025-02-13T17:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PATCH /tasks/:id/status

Atualizar status da tarefa.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tarefa atualizada"
}
```

---

## 🤖 Agentes de IA

### GET /ai-agents

Listar agentes de IA.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Atendente Virtual",
      "description": "Bot para atendimento inicial",
      "provider": "openai",
      "model": "gpt-4",
      "is_active": true,
      "usage_count": 1250,
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

---

### POST /ai-agents

Criar agente de IA.

**Request Body:**
```json
{
  "name": "Bot Vendas",
  "description": "Agente para qualificação de leads",
  "provider": "openai",
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000,
  "system_prompt": "Você é um especialista em vendas...",
  "welcome_message": "Olá! Sou o assistente virtual. Como posso ajudar?",
  "trigger_on_new_conversation": true,
  "trigger_keywords": ["bot", "atendente virtual"],
  "handoff_keywords": ["falar com humano", "atendente"],
  "assigned_department_id": "uuid",
  "knowledge_base": "Base de conhecimento do produto..."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 📈 Dashboard e Analytics

### GET /analytics/dashboard

Obter KPIs do dashboard.

**Query Parameters:**
- `period`: today, week, month, year, custom
- `date_from`: Data inicial (se custom)
- `date_to`: Data final (se custom)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": {
      "total": 245,
      "open": 45,
      "pending": 12,
      "resolved": 188,
      "average_first_response_time": 180, // segundos
      "average_resolution_time": 3600, // segundos
      "satisfaction_rating": 4.7
    },
    "messages": {
      "total": 5678,
      "inbound": 3234,
      "outbound": 2444,
      "by_channel": {
        "whatsapp": 3456,
        "instagram": 1234,
        "telegram": 567,
        "email": 421
      }
    },
    "contacts": {
      "total": 1234,
      "new": 45,
      "active": 890,
      "by_source": {
        "whatsapp": 567,
        "instagram": 234,
        "manual": 123
      }
    },
    "deals": {
      "total": 67,
      "total_value": 456000.00,
      "won": 23,
      "won_value": 178000.00,
      "lost": 5,
      "lost_value": 34000.00,
      "win_rate": 0.82,
      "average_deal_size": 6805.97
    },
    "team": {
      "total_users": 15,
      "online_users": 8,
      "top_performers": [
        {
          "user": { ... },
          "conversations_resolved": 45,
          "average_rating": 4.9
        }
      ]
    },
    "charts": {
      "conversations_by_day": [ ... ],
      "deals_by_stage": [ ... ],
      "messages_by_hour": [ ... ]
    }
  }
}
```

---

## 📊 Relatórios

### GET /reports/conversations

Relatório de conversas.

**Query Parameters:**
- `date_from`, `date_to`: Período
- `channel_id`: Filtrar por canal
- `user_id`: Filtrar por usuário
- `department_id`: Filtrar por setor
- `format`: json, csv, pdf

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_conversations": 245,
      "average_first_response": 180,
      "average_resolution_time": 3600,
      "satisfaction_rating": 4.7
    },
    "by_user": [ ... ],
    "by_channel": [ ... ],
    "by_day": [ ... ]
  }
}
```

---

## 🔗 Webhooks

### GET /webhooks

Listar webhooks.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Integração n8n",
      "url": "https://n8n.empresa.com/webhook/...",
      "events": ["message.received", "conversation.closed"],
      "is_active": true,
      "total_calls": 1234,
      "failed_calls": 5,
      "last_called_at": "2025-02-11T10:25:00Z"
    }
  ]
}
```

---

### POST /webhooks

Criar webhook.

**Request Body:**
```json
{
  "name": "Integração CRM Externo",
  "url": "https://external-crm.com/webhook",
  "events": ["deal.won", "deal.lost"],
  "secret_token": "seu_token_secreto",
  "custom_headers": {
    "X-API-Key": "api_key_here"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 💳 Assinaturas e Pagamentos

### GET /subscriptions/current

Obter assinatura atual do tenant.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan": "professional",
    "status": "active",
    "amount": 297.00,
    "currency": "BRL",
    "billing_cycle": "monthly",
    "current_period_start": "2025-02-01",
    "current_period_end": "2025-03-01",
    "cancel_at_period_end": false,
    "limits": {
      "max_users": 15,
      "max_contacts": 10000,
      "max_channels": 10
    },
    "usage": {
      "users": 8,
      "contacts": 1234,
      "channels": 5
    }
  }
}
```

---

### POST /subscriptions/upgrade

Fazer upgrade de plano.

**Request Body:**
```json
{
  "plan": "enterprise",
  "billing_cycle": "yearly"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": { ... },
    "proration": {
      "amount": 150.00,
      "description": "Diferença proporcional do período"
    }
  }
}
```

---

### POST /subscriptions/cancel

Cancelar assinatura.

**Request Body:**
```json
{
  "reason": "Motivo do cancelamento",
  "cancel_immediately": false // ou true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Assinatura será cancelada ao final do período"
}
```

---

### GET /payments

Histórico de pagamentos.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 297.00,
      "currency": "BRL",
      "status": "paid",
      "payment_method": "credit_card",
      "paid_at": "2025-02-01T10:00:00Z",
      "invoice_url": "https://..."
    }
  ],
  "pagination": { ... }
}
```

---

## 🔌 WebSocket Events

### Namespace: `/chat`

**Eventos do Cliente:**
```javascript
// Entrar em uma conversa
socket.emit('conversation:join', { conversation_id: 'uuid' });

// Sair de uma conversa
socket.emit('conversation:leave', { conversation_id: 'uuid' });

// Enviar mensagem
socket.emit('message:send', {
  conversation_id: 'uuid',
  content: 'Olá!',
  content_type: 'text'
});

// Indicar digitação
socket.emit('typing:start', { conversation_id: 'uuid' });
socket.emit('typing:stop', { conversation_id: 'uuid' });

// Marcar mensagem como lida
socket.emit('message:read', { message_id: 'uuid' });
```

**Eventos do Servidor:**
```javascript
// Nova mensagem
socket.on('message:new', (data) => {
  // { message: { ... } }
});

// Mensagem atualizada (status)
socket.on('message:updated', (data) => {
  // { message_id: 'uuid', status: 'read' }
});

// Usuário digitando
socket.on('typing', (data) => {
  // { conversation_id: 'uuid', user: { ... }, is_typing: true }
});

// Conversa atualizada
socket.on('conversation:updated', (data) => {
  // { conversation: { ... } }
});
```

---

## 📚 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Requisição inválida |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email já cadastrado) |
| 422 | Unprocessable Entity - Erro de validação |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro interno do servidor |

---

## 🚀 Rate Limiting

Limites de requisições por endpoint:

- **Autenticação**: 5 req/min
- **Envio de mensagens**: 30 req/min
- **Upload de arquivos**: 10 req/min
- **Demais endpoints**: 60 req/min

Headers de resposta:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1644578400
```

---

**Última Atualização**: 11 de Fevereiro de 2025
