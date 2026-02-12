# 🚀 Deploy via Portainer - Dialogix CRM

## 📋 PRÉ-REQUISITOS

- ✅ Servidor com Docker + Portainer instalado
- ✅ DNS configurados (dev.dialogix.com.br + api-dev.dialogix.com.br)
- ✅ Portas 80 e 443 abertas no firewall

---

## 🐳 PASSO 1: Preparar Repositório no Servidor

```bash
# SSH no servidor
ssh root@SEU_IP_SERVIDOR

# Criar diretório
mkdir -p /opt/dialogix-crm
cd /opt/dialogix-crm

# Clonar repositório
git clone https://github.com/maurilio-vilela/dialogix-crm.git .

# Copiar .env
cp .env.production .env

# IMPORTANTE: As senhas podem ser alteradas depois no Portainer
# Por enquanto, deixe como está
```

---

## 📦 PASSO 2: Criar Stack no Portainer

### Acessar Portainer:
- URL: http://SEU_IP:9000 (ou porta configurada)
- Login com suas credenciais

### Criar Nova Stack:

1. **Menu lateral** → **Stacks**
2. **Add stack**
3. **Nome:** `dialogix-crm-dev`
4. **Build method:** Git Repository

### Configurações Git:

- **Repository URL:** `https://github.com/maurilio-vilela/dialogix-crm`
- **Repository reference:** `refs/heads/main`
- **Compose path:** `docker-compose.yml`

**OU** (se preferir upload manual):

- **Build method:** Web editor
- Copiar e colar conteúdo do `docker-compose.yml`

### Environment Variables (adicionar):

```env
# Database
DATABASE_NAME=dialogix_crm_dev
DATABASE_USER=dialogix
DATABASE_PASSWORD=TROCAR_NO_PORTAINER_123
REDIS_PASSWORD=TROCAR_NO_PORTAINER_456

# JWT
JWT_SECRET=TROCAR_NO_PORTAINER_JWT_SECRET_MIN_32_CHARS

# URLs (já corretas)
NODE_ENV=development
FRONTEND_URL=https://dev.dialogix.com.br
VITE_API_URL=https://api-dev.dialogix.com.br
VITE_WS_URL=wss://api-dev.dialogix.com.br
```

5. **Deploy the stack** → Aguardar build (~5-10 min)

---

## 🔐 PASSO 3: Atualizar Senhas no Portainer

### Depois que a stack subir:

1. **Stacks** → `dialogix-crm-dev`
2. **Editor** (ícone de lápis)
3. **Environment variables**
4. Trocar valores:
   - `DATABASE_PASSWORD`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
5. **Update the stack**
6. Aguardar restart dos containers

**Gerar senhas seguras:**
```bash
# No terminal do servidor:
openssl rand -base64 32
```

---

## 🗄️ PASSO 4: Executar Migrations

### Via Portainer:

1. **Containers** → `dialogix-backend`
2. **Console** (ícone de terminal)
3. Selecionar **/bin/sh**
4. **Connect**

### No terminal do container:

```bash
# Rodar migrations
npm run migration:run

# Verificar tabelas criadas
npm run typeorm -- query "SELECT tablename FROM pg_tables WHERE schemaname='public'"

# Rodar seeds
npm run seed:run
```

**Saída esperada dos seeds:**
```
✅ Seed completed successfully!

📋 Test Credentials:
   Admin: admin@dialogix.com.br / admin123
   Agent: agent@dialogix.com.br / agent123

🎯 Demo Data:
   Tenant: Dialogix Demo
   Contacts: 10
   Tags: 5
   Pipeline Stages: 5
   Deals: 5
```

---

## ✅ PASSO 5: Verificar Deploy

### Testar Frontend:
- Abrir: **https://dev.dialogix.com.br**
- ✅ Página carrega (SSL verde)

### Testar Backend API:
- Abrir: **https://api-dev.dialogix.com.br/api/docs**
- ✅ Swagger UI carrega

### Verificar Logs no Portainer:

1. **Containers** → `dialogix-backend`
2. **Logs** (ícone de documento)
3. Procurar por:
   - ✅ "Nest application successfully started"
   - ❌ Nenhum erro de conexão

### Testar Login (após ter frontend):
```bash
curl -X POST https://api-dev.dialogix.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dialogix.com.br",
    "password": "admin123"
  }'
```

**Deve retornar:** `{"access_token": "..."}`

---

## 🔄 ATUALIZAR CÓDIGO (Git Pull)

### Opção A - Recrear Stack:
1. **Stacks** → `dialogix-crm-dev`
2. **Editor**
3. **Pull and redeploy** (checkbox)
4. **Update the stack**

### Opção B - Webhook Automático:
1. **Stacks** → `dialogix-crm-dev` → **Webhooks**
2. Copiar URL do webhook
3. Configurar em **GitHub** → Settings → Webhooks
4. A cada push, Portainer atualiza automaticamente

---

## 📊 MONITORAMENTO NO PORTAINER

### Ver Recursos:
- **Dashboard** → Ver CPU/RAM dos containers

### Ver Logs em Tempo Real:
- **Containers** → Selecionar container → **Logs**
- Marcar "Auto-refresh"

### Restart Container:
- **Containers** → Selecionar → **Restart**

### Rebuild Stack:
- **Stacks** → Stack → **Editor** → **Update**

---

## 🆘 TROUBLESHOOTING

### Stack não sobe:

1. **Logs da stack** (botão de logs ao lado da stack)
2. Verificar erros de syntax no docker-compose.yml
3. Verificar se portas 80/443 estão livres

### Backend não conecta no PostgreSQL:

1. **Console do backend** → testar conexão:
```bash
env | grep DATABASE
# Deve mostrar variáveis corretas
```

2. **Console do postgres** → verificar banco:
```bash
psql -U dialogix -d dialogix_crm_dev -c '\dt'
```

### SSL não funciona:

1. Verificar logs do Traefik:
   - **Containers** → `dialogix-traefik` → **Logs**
   - Procurar por "certificate" ou "acme"

2. Deletar certificados e recriar:
   - **Volumes** → `dialogix-crm_traefik_certs` → **Remove**
   - **Stacks** → Stack → **Restart**

### Atualizar código não funciona:

1. Marcar "Re-pull image and redeploy" ao atualizar stack
2. Ou parar stack, remover containers, recriar

---

## 📝 COMANDOS ÚTEIS (Console Container)

### Backend:
```bash
# Ver variáveis de ambiente
env | grep -E 'DATABASE|JWT|REDIS'

# Rodar migration específica
npm run migration:run -- -t 1707750000000

# Reverter última migration
npm run migration:revert

# Ver logs da aplicação
tail -f logs/app.log
```

### PostgreSQL:
```bash
# Entrar no psql
psql -U dialogix -d dialogix_crm_dev

# Ver tabelas
\dt

# Ver dados de uma tabela
SELECT * FROM tenants;

# Contar registros
SELECT COUNT(*) FROM users;
```

---

## 🎯 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. ✅ Trocar senhas no Portainer
2. ✅ Testar login: admin@dialogix.com.br / admin123
3. ⏳ Implementar autenticação no backend
4. ⏳ Criar página de login no frontend
5. ⏳ Integrar frontend com backend (chamadas API)

---

**Guia criado por:** Lúcia 💡  
**Plataforma:** Portainer  
**Tempo estimado:** 20-30 minutos
