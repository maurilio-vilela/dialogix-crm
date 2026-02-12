# 🚀 SETUP COMPLETO - Dialogix CRM

## 📦 Arquivos Criados

### Docker
- ✅ `docker-compose.yml` - Stack completa (PostgreSQL, Redis, Backend, Frontend)
- ✅ `backend/Dockerfile.dev` - Container de desenvolvimento backend
- ✅ `frontend/Dockerfile.dev` - Container de desenvolvimento frontend

### Configuração
- ✅ `backend/.env.example` - 80+ variáveis documentadas
- ✅ `frontend/.env.example` - Variáveis do frontend

### Serviços Incluídos
- **PostgreSQL 15** - Banco principal (porta 5432)
- **Redis 7** - Cache e filas (porta 6379)
- **Backend NestJS** - API REST (porta 3000)
- **Frontend React** - Interface (porta 5173)
- **Adminer** - Admin do PostgreSQL (porta 8080)
- **Redis Commander** - Admin do Redis (porta 8081)

---

## 🏃 Como Rodar Agora

```bash
# 1. Navegue até o projeto
cd /root/.openclaw/workspace/dialogix-crm

# 2. Copie os .env examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Suba a stack completa
docker-compose up -d

# 4. Verifique os logs
docker-compose logs -f backend

# 5. Acesse as interfaces
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api/docs
# Adminer: http://localhost:8080
# Redis UI: http://localhost:8081
```

---

## 🎯 Próximos Passos (PRIORIDADE)

### 1. Criar Migrations TypeORM
```bash
cd backend
npm run typeorm migration:create src/database/migrations/CreateInitialTables
# Implementar as 26 tabelas
npm run migration:run
```

### 2. Criar Seeds de Teste
```bash
# Criar arquivo src/database/seeds/initial-seed.ts
# Criar 1 tenant, 2 users, 5 contacts
npm run seed:run
```

### 3. Implementar Auth Module
- Login/Register endpoints
- JWT strategy
- Auth guards
- Testar com Postman/Insomnia

### 4. Criar Componentes Base Frontend
- Instalar Shadcn/ui components
- Button, Input, Card, Dialog, etc.
- Layout components (Sidebar, Header)

### 5. Páginas de Login/Register
- UI funcional
- Integração com backend
- Redirecionamento após login

---

## 📋 Checklist de Validação

- [ ] `docker-compose up -d` roda sem erros
- [ ] PostgreSQL conectando (Adminer abre)
- [ ] Redis conectando (Redis Commander abre)
- [ ] Backend subindo (logs sem erro)
- [ ] Frontend abrindo em http://localhost:5173
- [ ] Swagger disponível em /api/docs
- [ ] Migrations criadas e executadas
- [ ] Seeds populando dados de teste
- [ ] Login funcional (backend + frontend)
- [ ] Token JWT sendo gerado
- [ ] Primeira tela protegida renderizando

---

## ⚠️ Problemas Comuns

### Backend não conecta no PostgreSQL
```bash
# Verificar se o postgres está rodando
docker-compose ps postgres

# Ver logs do postgres
docker-compose logs postgres

# Recriar container
docker-compose down postgres
docker-compose up -d postgres
```

### Frontend não conecta na API
```bash
# Verificar VITE_API_URL no .env
cat frontend/.env | grep VITE_API_URL

# Deve ser: http://localhost:3000/api/v1
```

### Porta já em uso
```bash
# Descobrir processo usando a porta
lsof -i :3000

# Mudar porta no docker-compose.yml
ports:
  - "3001:3000"  # Nova porta externa
```

---

## 🔧 Comandos Úteis

```bash
# Ver status de todos os containers
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar um serviço
docker-compose restart backend

# Parar tudo
docker-compose down

# Parar e remover volumes (limpa banco)
docker-compose down -v

# Rebuild após mudança no Dockerfile
docker-compose up -d --build

# Entrar no container do backend
docker-compose exec backend sh

# Executar comando no backend
docker-compose exec backend npm run migration:run

# Ver uso de recursos
docker stats
```

---

**Criado por:** Lúcia 💡  
**Data:** 2026-02-12  
**Status:** ✅ Ambiente pronto para desenvolvimento
