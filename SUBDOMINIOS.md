# 🌐 Configuração de Subdomínios - Dialogix CRM

## 📋 Estratégia de Domínios

### Produção Atual (Whaticket):
- ✅ `app.dialogix.com.br` - Frontend atual (porta 3000)
- ✅ `api.dialogix.com.br` - Backend atual (porta 4001)

### Nova Versão - Dialogix CRM V2:

#### Desenvolvimento:
- `dev.dialogix.com.br` - Frontend desenvolvimento
- `api-dev.dialogix.com.br` - Backend API desenvolvimento

#### Staging/QA:
- `staging.dialogix.com.br` - Frontend homologação
- `api-staging.dialogix.com.br` - Backend API homologação

#### Produção V2:
- `v2.dialogix.com.br` - Frontend nova versão
- `api-v2.dialogix.com.br` - Backend API nova versão

#### Futuro (após migração 100%):
- `app.dialogix.com.br` → Nova versão
- `api.dialogix.com.br` → Nova versão
- `legacy.dialogix.com.br` → Versão antiga (Whaticket)

---

## 🔧 Configuração DNS

### No painel de DNS (Cloudflare, Route53, etc):

```
# Desenvolvimento
dev.dialogix.com.br         A    SEU_IP_VPS_DEV
api-dev.dialogix.com.br     A    SEU_IP_VPS_DEV

# Staging
staging.dialogix.com.br     A    SEU_IP_VPS_STAGING
api-staging.dialogix.com.br A    SEU_IP_VPS_STAGING

# Produção V2 (futuro)
v2.dialogix.com.br          A    SEU_IP_VPS_PROD
api-v2.dialogix.com.br      A    SEU_IP_VPS_PROD

# Traefik Dashboard (opcional - remover em produção)
traefik-dev.dialogix.com.br A    SEU_IP_VPS_DEV
```

---

## 📦 Arquivos Docker Compose

### 1. `docker-compose.dev.yml` - Desenvolvimento LOCAL
**Uso:** Máquina local, sem domínios
**Acesso:** 
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Adminer: http://localhost:8080
- Redis UI: http://localhost:8081

**Como usar:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. `docker-compose.yml` - Produção/Staging com Traefik
**Uso:** VPS com domínios configurados
**Recursos:**
- ✅ SSL automático (Let's Encrypt)
- ✅ Redirect HTTP → HTTPS
- ✅ CORS configurado
- ✅ Subdomínios gerenciados

**Ambientes suportados:**
- **DEV:** `dev.dialogix.com.br` + `api-dev.dialogix.com.br`
- **STAGING:** `staging.dialogix.com.br` + `api-staging.dialogix.com.br`
- **PROD V2:** `v2.dialogix.com.br` + `api-v2.dialogix.com.br`

---

## 🚀 Deploy por Ambiente

### Desenvolvimento (VPS Dev)

**1. Configurar .env:**
```bash
cd /root/dialogix-crm
cp .env.example .env
nano .env
```

```env
# .env para DEV
NODE_ENV=development
DATABASE_NAME=dialogix_crm_dev
DATABASE_USER=dialogix
DATABASE_PASSWORD=SUA_SENHA_SEGURA_DEV
REDIS_PASSWORD=SUA_SENHA_REDIS_DEV
JWT_SECRET=SUA_CHAVE_JWT_DEV_MUITO_SEGURA
FRONTEND_URL=https://dev.dialogix.com.br
VITE_API_URL=https://api-dev.dialogix.com.br
VITE_WS_URL=wss://api-dev.dialogix.com.br
```

**2. Subir stack:**
```bash
docker-compose up -d
```

**3. Verificar:**
```bash
docker-compose ps
docker-compose logs -f backend
```

**4. Acessar:**
- https://dev.dialogix.com.br (Frontend)
- https://api-dev.dialogix.com.br/api/docs (Swagger)

---

### Staging (VPS Staging)

**Alterar labels no docker-compose.yml:**
```yaml
# Backend
- "traefik.http.routers.backend-staging.rule=Host(`api-staging.dialogix.com.br`)"
# Frontend
- "traefik.http.routers.frontend-staging.rule=Host(`staging.dialogix.com.br`)"
```

**Atualizar .env:**
```env
NODE_ENV=staging
FRONTEND_URL=https://staging.dialogix.com.br
VITE_API_URL=https://api-staging.dialogix.com.br
```

---

### Produção V2 (Futuro)

**Alterar labels:**
```yaml
# Backend
- "traefik.http.routers.backend-v2.rule=Host(`api-v2.dialogix.com.br`)"
# Frontend
- "traefik.http.routers.frontend-v2.rule=Host(`v2.dialogix.com.br`)"
```

**Atualizar .env:**
```env
NODE_ENV=production
FRONTEND_URL=https://v2.dialogix.com.br
VITE_API_URL=https://api-v2.dialogix.com.br
```

---

## 🔐 Segurança Traefik

### Proteger Dashboard (produção):

```yaml
# Comentar essas linhas em produção:
# - "traefik.http.routers.traefik.rule=Host(`traefik-dev.dialogix.com.br`)"
# - "traefik.http.routers.traefik.service=api@internal"
```

### Rate Limiting (adicionar):

```yaml
# Em cada router:
- "traefik.http.middlewares.rate-limit.ratelimit.average=100"
- "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
- "traefik.http.routers.backend-dev.middlewares=cors-headers,rate-limit"
```

---

## 📊 Monitoramento

### Ver logs do Traefik:
```bash
docker logs -f dialogix-traefik
```

### Ver certificados SSL:
```bash
docker exec dialogix-traefik cat /letsencrypt/acme.json
```

### Renovar certificados:
```bash
# Automático - Let's Encrypt renova sozinho
# Verificar logs para confirmar
docker logs dialogix-traefik | grep -i acme
```

---

## 🆘 Troubleshooting

### Subdomínio não resolve:
1. Verificar DNS propagado: `dig dev.dialogix.com.br`
2. Verificar firewall: portas 80 e 443 abertas
3. Verificar Traefik rodando: `docker ps | grep traefik`

### SSL não funciona:
1. Verificar email no Traefik (deve ser válido)
2. Verificar logs: `docker logs dialogix-traefik | grep -i error`
3. Deletar volume e reiniciar: `docker volume rm dialogix-crm_traefik_certs`

### CORS error:
1. Verificar FRONTEND_URL no .env backend
2. Verificar labels do Traefik (accesscontrolalloworiginlist)
3. Testar com curl: `curl -I https://api-dev.dialogix.com.br`

---

## ✅ Checklist de Deploy

### Antes de subir:
- [ ] DNS configurado e propagado
- [ ] .env criado com valores corretos
- [ ] Firewall liberado (80, 443)
- [ ] Docker e Docker Compose instalados
- [ ] Código no servidor (git clone)

### Após subir:
- [ ] Containers rodando: `docker-compose ps`
- [ ] Logs sem erro: `docker-compose logs`
- [ ] SSL funcionando (cadeado verde)
- [ ] Frontend carrega: https://dev.dialogix.com.br
- [ ] API responde: https://api-dev.dialogix.com.br/api/docs
- [ ] CORS OK (testar login)

---

**Configurado por:** Lúcia 💡  
**Data:** 2026-02-12  
**Status:** ✅ Pronto para deploy com subdomínios
