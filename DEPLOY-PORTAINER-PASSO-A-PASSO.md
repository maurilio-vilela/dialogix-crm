# 🚀 Deploy Passo a Passo - Portainer UI
**Dialogix CRM - dev.dialogix.com.br**

---

## 📋 ANTES DE COMEÇAR

### 1. Preparar repositório no servidor

Execute no servidor (SSH ou terminal do host):

```bash
# Criar diretório
mkdir -p /opt/dialogix-crm
cd /opt/dialogix-crm

# Clonar repositório
git clone https://github.com/maurilio-vilela/dialogix-crm.git .

# Verificar arquivos
ls -la
```

**Deve listar:** backend/, frontend/, docker-compose.traefik.yml, etc.

---

## 🐳 PASSO 1: Criar Stack no Portainer

### Acessar Portainer:
- URL: https://portainer.dialogix.com.br
- Faça login

### Criar nova Stack:

1. **Menu lateral esquerdo** → **Stacks**
2. **Botão azul** → **+ Add stack**

---

## 📝 PASSO 2: Configurar Stack

### Informações básicas:

**Nome da stack:**
```
dialogix-crm-dev
```

### Build method:
Selecione: **📁 Repository** (ou **Git repository**)

### Repository config:

**Repository URL:**
```
https://github.com/maurilio-vilela/dialogix-crm
```

**Repository reference:**
```
refs/heads/main
```

**Compose path:**
```
docker-compose.traefik.yml
```

**✅ Marcar:** Automatic updates (opcional - atualiza a cada push)

---

## ⚙️ PASSO 3: Environment Variables

**Clicar em:** Advanced mode (ou + add environment variable)

**Adicionar as seguintes variáveis:**

```env
NODE_ENV=development
DATABASE_NAME=dialogix_crm_dev
DATABASE_USER=dialogix
DATABASE_PASSWORD=DialogixSecure2026!
REDIS_PASSWORD=RedisSecure2026!
JWT_SECRET=JWTSuperSecretKey2026MinimumThirtyTwoCharacters!
JWT_EXPIRATION=7d
FRONTEND_URL=https://dev.dialogix.com.br
VITE_API_URL=https://api-dev.dialogix.com.br
VITE_WS_URL=wss://api-dev.dialogix.com.br
```

**⚠️ IMPORTANTE:** Troque as senhas depois!

---

## 🌐 PASSO 4: Deploy

1. **Rolar até o final da página**
2. **Clicar em:** Deploy the stack (botão azul)
3. **Aguardar build** (~5-10 minutos na primeira vez)

**Você verá:**
- Container sendo criado
- Imagens sendo baixadas
- Build do backend e frontend

**Status final esperado:** ✅ Running (verde)

---

## 📊 PASSO 5: Verificar Containers

### Após deploy:

1. **Menu** → **Containers**
2. Verificar se estão **Running** (verde):
   - `dialogix-backend-dev`
   - `dialogix-frontend-dev`
   - `dialogix-postgres-dev`
   - `dialogix-redis-dev`

### Ver logs de cada container:

1. **Clicar no nome do container**
2. **Aba Logs**
3. **Marcar:** Auto-refresh logs

**Backend deve mostrar:**
```
Nest application successfully started on port 3000
```

---

## 🗄️ PASSO 6: Executar Migrations e Seeds

### Abrir console do backend:

1. **Containers** → `dialogix-backend-dev`
2. **Botão:** >_ Console (ou Exec console)
3. **Command:** Selecionar `/bin/sh` (ou deixar padrão)
4. **Connect**

### No terminal que abrir, executar:

```bash
# Rodar migrations (criar tabelas)
npm run migration:run

# Aguardar mensagem de sucesso
# Deve criar 16 tabelas

# Rodar seeds (popular dados de teste)
npm run seed:run
```

**Saída esperada:**
```
✅ Seed completed successfully!

📋 Test Credentials:
   Admin: admin@dialogix.com.br / admin123
   Agent: agent@dialogix.com.br / agent123

🎯 Demo Data:
   Tenant: Dialogix Demo
   Contacts: 10
   Tags: 5
   Deals: 5
```

---

## ✅ PASSO 7: Testar Acesso

### Frontend:
Abrir no navegador: **https://dev.dialogix.com.br**

**Esperado:**
- ✅ Página carrega (pode estar em branco por enquanto)
- ✅ Cadeado verde (SSL funcionando)
- ✅ Sem erro de conexão

### Backend API:
Abrir no navegador: **https://api-dev.dialogix.com.br/api/docs**

**Esperado:**
- ✅ Swagger UI carrega
- ✅ Lista de endpoints aparece
- ✅ Cadeado verde

### Testar saúde da API:
```
https://api-dev.dialogix.com.br/api/v1/health
```

**Deve retornar:** `{"status":"ok"}`

---

## 🔐 PASSO 8: Alterar Senhas (Recomendado)

### Via Portainer:

1. **Stacks** → `dialogix-crm-dev`
2. **Botão:** ✏️ Editor
3. **Aba:** Environment variables
4. **Editar:**
   - `DATABASE_PASSWORD`
   - `REDIS_PASSWORD`
   - `JWT_SECRET`
5. **Botão:** Update the stack
6. **Marcar:** ✅ Re-pull image and redeploy

**Aguardar restart** (~2 minutos)

---

## 🆘 TROUBLESHOOTING

### ❌ Container não inicia (vermelho):

1. Ver logs do container
2. Procurar por erro em destaque
3. Comum: senhas faltando ou rede errada

**Solução:** Verificar environment variables

### ❌ Erro "network traefik-public not found":

**Solução:** Criar rede manualmente:
```bash
docker network create traefik-public
```

### ❌ Backend não conecta no PostgreSQL:

1. Console do backend → `env | grep DATABASE`
2. Verificar se variáveis estão corretas
3. Verificar se postgres está rodando

### ❌ SSL não funciona:

1. Verificar DNS: `dig dev.dialogix.com.br`
2. Deve apontar para o IP do servidor
3. Aguardar alguns minutos (Let's Encrypt pode demorar)

### ❌ Página em branco no frontend:

**É NORMAL!** Frontend ainda não tem código implementado.
- O importante é: SSL verde + sem erro 404
- Implementação vem na próxima fase

---

## 📊 APÓS DEPLOY BEM-SUCEDIDO

### Verificações finais:

- [x] 4 containers rodando
- [x] Migrations executadas (16 tabelas)
- [x] Seeds executados (dados de teste)
- [x] Frontend acessível com SSL
- [x] Backend API acessível com SSL
- [x] Swagger docs carregando

### Credenciais de teste:
```
Admin: admin@dialogix.com.br / admin123
Agent: agent@dialogix.com.br / agent123
```

---

## 🎯 PRÓXIMOS PASSOS

Agora que a infraestrutura está rodando:

1. ⏳ Implementar autenticação no backend
2. ⏳ Criar página de login no frontend
3. ⏳ Integrar frontend com backend
4. ⏳ Implementar CRUD de contatos

**Tempo estimado para deploy:** 15-20 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

---

**Guia criado por:** Lúcia 💡  
**Data:** 2026-02-12 14:30  
**Versão:** 1.0 - Portainer UI
