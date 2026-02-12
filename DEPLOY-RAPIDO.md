# 🚀 Deploy Rápido - Ambiente DEV
# Dialogix CRM - dev.dialogix.com.br

## ✅ PRÉ-REQUISITOS CHECKLIST

- [ ] DNS configurados (dev.dialogix.com.br + api-dev.dialogix.com.br)
- [ ] Servidor com Docker e Docker Compose instalados
- [ ] Portas 80 e 443 abertas no firewall
- [ ] Git instalado
- [ ] Código clonado no servidor

---

## 🔧 PASSO 1: Preparar Servidor

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Instalar Docker Compose
apt install -y docker-compose-plugin

# Instalar jq (para script DNS)
apt install -y jq git

# Verificar instalação
docker --version
docker compose version
```

---

## 🌐 PASSO 2: Configurar DNS (Automático)

**Opção A - Via Script (Recomendado):**
```bash
cd /root
git clone git@github.com:maurilio-vilela/dialogix-crm.git
cd dialogix-crm

# Configurar credenciais Cloudflare
export CLOUDFLARE_API_TOKEN="seu_token_cloudflare"
export CLOUDFLARE_ZONE_ID="seu_zone_id"
export SERVER_IP=$(curl -s ifconfig.me)

# Executar script
chmod +x scripts/configure-dns.sh
./scripts/configure-dns.sh
# Escolher opção 1 (Desenvolvimento)
```

**Opção B - Manual (já feito pelo mestre):**
- ✅ dev.dialogix.com.br → IP do servidor
- ✅ api-dev.dialogix.com.br → IP do servidor

**Verificar propagação:**
```bash
dig dev.dialogix.com.br +short
dig api-dev.dialogix.com.br +short
# Deve retornar o IP do servidor
```

---

## 🔐 PASSO 3: Configurar .env

```bash
cd /root/dialogix-crm

# Copiar template
cp .env.production .env

# Editar com nano/vim
nano .env
```

**Valores OBRIGATÓRIOS para mudar:**
```env
# Senhas seguras
DATABASE_PASSWORD=SuaSenhaPostgresSegura2026!
REDIS_PASSWORD=SuaSenhaRedisSegura2026!
JWT_SECRET=ChaveJWTMuitoSeguraMin32Caracteres2026!
JWT_REFRESH_SECRET=ChaveRefreshMuitoSeguraMin32Caracteres2026!

# URLs (já devem estar corretas)
FRONTEND_URL=https://dev.dialogix.com.br
VITE_API_URL=https://api-dev.dialogix.com.br
VITE_WS_URL=wss://api-dev.dialogix.com.br

# Email (se for usar)
SMTP_PASSWORD=sua_chave_sendgrid

# Resto pode deixar como está por enquanto
```

**Gerar senhas seguras:**
```bash
# Gerar senhas aleatórias
openssl rand -base64 32
openssl rand -hex 16
```

---

## 🐳 PASSO 4: Subir Stack Docker

```bash
cd /root/dialogix-crm

# Verificar se .env está correto
cat .env | grep -E 'DATABASE_PASSWORD|JWT_SECRET|FRONTEND_URL'

# Subir containers
docker compose up -d

# Aguardar containers iniciarem (30-60 segundos)
sleep 30

# Verificar status
docker compose ps
```

**Saída esperada:**
```
NAME                  STATUS    PORTS
dialogix-backend      Up        
dialogix-frontend     Up        
dialogix-postgres     Up        
dialogix-redis        Up        
dialogix-traefik      Up        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## 📋 PASSO 5: Verificar Logs

```bash
# Ver logs de todos os serviços
docker compose logs

# Ver logs do backend (procurar erros)
docker compose logs backend

# Ver logs do Traefik (verificar SSL)
docker compose logs traefik

# Seguir logs em tempo real
docker compose logs -f backend
```

**Sinais de sucesso:**
- Backend: "Nest application successfully started"
- Traefik: "Adding certificate for domain"
- Sem erros de conexão com PostgreSQL/Redis

---

## ✅ PASSO 6: Testar Acessos

### Frontend:
```bash
curl -I https://dev.dialogix.com.br
# Deve retornar: HTTP/2 200
```

Abrir no navegador: **https://dev.dialogix.com.br**
- ✅ Página carrega (mesmo que vazia/erro no momento)
- ✅ Cadeado verde (SSL funcionando)

### Backend API:
```bash
curl -I https://api-dev.dialogix.com.br/api/v1/health
# Deve retornar: HTTP/2 200
```

Abrir no navegador: **https://api-dev.dialogix.com.br/api/docs**
- ✅ Swagger UI carrega
- ✅ Endpoints listados

### WebSocket:
```bash
curl -I https://api-dev.dialogix.com.br/socket.io/
# Deve aceitar conexão
```

---

## 🗄️ PASSO 7: Migrations e Seeds (PRÓXIMO)

**Aguardar criação das migrations (próxima etapa)**

Quando prontas:
```bash
# Entrar no container backend
docker compose exec backend sh

# Rodar migrations
npm run migration:run

# Rodar seeds
npm run seed:run

# Sair
exit
```

---

## 🔍 TROUBLESHOOTING

### Containers não sobem:
```bash
# Ver logs detalhados
docker compose logs

# Recriar containers
docker compose down
docker compose up -d --build
```

### SSL não funciona:
```bash
# Verificar logs do Traefik
docker compose logs traefik | grep -i error

# Deletar certificados e tentar novamente
docker compose down
docker volume rm dialogix-crm_traefik_certs
docker compose up -d
```

### Backend não conecta no PostgreSQL:
```bash
# Verificar se postgres está rodando
docker compose ps postgres

# Testar conexão manual
docker compose exec postgres psql -U dialogix -d dialogix_crm_dev -c '\dt'

# Verificar senha no .env
cat .env | grep DATABASE_PASSWORD
```

### Frontend retorna 502/503:
```bash
# Backend pode estar demorando a subir
docker compose logs backend

# Aguardar mais tempo ou reiniciar
docker compose restart backend
```

### CORS error:
```bash
# Verificar FRONTEND_URL no .env
cat .env | grep FRONTEND_URL

# Deve ser exatamente: https://dev.dialogix.com.br
# Reiniciar backend após mudança
docker compose restart backend
```

---

## 📊 MONITORAMENTO

### Ver recursos usados:
```bash
docker stats
```

### Ver espaço em disco:
```bash
docker system df
```

### Limpar recursos não usados:
```bash
docker system prune -a
```

### Backup do banco:
```bash
docker compose exec postgres pg_dump -U dialogix dialogix_crm_dev > backup.sql
```

### Restaurar banco:
```bash
cat backup.sql | docker compose exec -T postgres psql -U dialogix -d dialogix_crm_dev
```

---

## 🎯 PRÓXIMOS PASSOS

Após deploy bem-sucedido:

1. ✅ Verificar acesso: https://dev.dialogix.com.br
2. ✅ Verificar API: https://api-dev.dialogix.com.br/api/docs
3. ⏳ Criar migrations (26 tabelas)
4. ⏳ Criar seeds de teste
5. ⏳ Implementar autenticação
6. ⏳ Testar login funcional

---

**Deploy preparado por:** Lúcia 💡  
**Tempo estimado:** 15-20 minutos  
**Dificuldade:** ⭐⭐⭐☆☆ (Médio)
