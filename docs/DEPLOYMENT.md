# Guia de Deploy - Dialogix CRM

## 🚀 Preparação do Ambiente VPS Ubuntu

### Requisitos Mínimos

**Servidor:**
- Ubuntu 22.04 LTS
- 4 GB RAM (mínimo) / 8 GB RAM (recomendado)
- 2 vCPUs (mínimo) / 4 vCPUs (recomendado)
- 40 GB SSD

**Softwares Necessários:**
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- Nginx
- PM2
- Git

---

## 📦 Instalação de Dependências

### 1. Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v  # deve mostrar v20.x.x
npm -v
```

### 3. Instalar PostgreSQL 15

```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql

# Dentro do psql:
CREATE USER dialogix WITH PASSWORD 'sua_senha_forte_aqui';
CREATE DATABASE dialogix_crm OWNER dialogix;
GRANT ALL PRIVILEGES ON DATABASE dialogix_crm TO dialogix;

# Habilitar extensão UUID
\c dialogix_crm
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### 4. Instalar Redis

```bash
sudo apt install -y redis-server

# Configurar para iniciar automaticamente
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Testar
redis-cli ping  # deve retornar PONG
```

### 5. Instalar Nginx

```bash
sudo apt install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Instalar PM2

```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar com o sistema
pm2 startup systemd
# Execute o comando que for retornado
```

### 7. Instalar Certbot (SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 🔧 Configuração do Servidor

### 1. Criar Usuário para Deploy

```bash
# Criar usuário
sudo adduser dialogix
sudo usermod -aG sudo dialogix

# Trocar para o novo usuário
su - dialogix
```

### 2. Configurar Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 3. Gerar Chave SSH (para Git)

```bash
ssh-keygen -t ed25519 -C "deploy@dialogix.com"
cat ~/.ssh/id_ed25519.pub
# Adicione a chave pública no GitHub (Settings > SSH Keys)
```

---

## 📂 Deploy da Aplicação

### 1. Clonar Repositório

```bash
cd /home/dialogix
git clone git@github.com:seu-usuario/dialogix-crm.git
cd dialogix-crm
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << 'EOF'
# Aplicação
NODE_ENV=production
PORT=3000
API_URL=https://api.seudominio.com

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=dialogix
DB_PASSWORD=sua_senha_forte_aqui
DB_DATABASE=dialogix_crm

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=gere_uma_chave_aleatoria_muito_forte_aqui_use_openssl
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=outra_chave_aleatoria_forte
JWT_REFRESH_EXPIRES_IN=30d

# Integrações WhatsApp
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app

# IA - OpenAI
OPENAI_API_KEY=sk-...

# IA - Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# IA - Google Gemini
GOOGLE_AI_API_KEY=...

# IA - xAI Grok
XAI_API_KEY=...

# AWS S3 (ou MinIO)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=dialogix-files

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=https://seudominio.com

# Logs
LOG_LEVEL=info
EOF

# Gerar chaves secretas fortes
openssl rand -base64 64  # Use para JWT_SECRET
openssl rand -base64 64  # Use para JWT_REFRESH_SECRET

# Build
npm run build

# Rodar migrations
npm run migration:run

# Seed inicial (opcional)
npm run seed:run
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env << 'EOF'
VITE_API_URL=https://api.seudominio.com/api/v1
VITE_WS_URL=wss://api.seudominio.com
VITE_APP_NAME=Dialogix CRM
VITE_APP_VERSION=1.0.0
EOF

# Build
npm run build
```

### 4. Configurar PM2

```bash
cd /home/dialogix/dialogix-crm/backend

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'dialogix-api',
      script: 'dist/main.js',
      instances: 2, // Usar 2 instâncias para HA
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      max_memory_restart: '1G'
    },
    {
      name: 'dialogix-websocket',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        WS_ONLY: true
      },
      error_file: 'logs/ws-err.log',
      out_file: 'logs/ws-out.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};
EOF

# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save
```

---

## 🌐 Configurar Nginx

### 1. Criar Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/dialogix
```

Cole a seguinte configuração:

```nginx
# API Backend
server {
    listen 80;
    server_name api.seudominio.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket endpoint
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket timeouts
        proxy_read_timeout 86400;
    }
}

# Frontend
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    root /home/dialogix/dialogix-crm/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Habilitar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/dialogix /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 3. Configurar SSL com Let's Encrypt

```bash
# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com -d api.seudominio.com

# Renovação automática já está configurada via systemd timer
sudo systemctl status certbot.timer
```

---

## 🔄 Automação de Deploy (CI/CD)

### GitHub Actions Workflow

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/dialogix/dialogix-crm
            git pull origin main
            
            # Backend
            cd backend
            npm install
            npm run build
            npm run migration:run
            
            # Frontend
            cd ../frontend
            npm install
            npm run build
            
            # Restart PM2
            pm2 restart ecosystem.config.js
            
            # Health check
            sleep 5
            curl -f http://localhost:3000/health || exit 1
```

---

## 📊 Monitoramento

### 1. Monitorar PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs de um app específico
pm2 logs dialogix-api

# Ver métricas
pm2 monit
```

### 2. Monitorar com PM2 Plus (opcional)

```bash
# Criar conta em https://app.pm2.io
pm2 link <secret_key> <public_key>
```

### 3. Logs do Nginx

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log
```

### 4. Logs do PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 🔐 Backup

### 1. Backup do Banco de Dados

Criar script `/home/dialogix/scripts/backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/dialogix/backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="dialogix_crm_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Backup
PGPASSWORD='sua_senha_forte_aqui' pg_dump -h localhost -U dialogix dialogix_crm | gzip > "$BACKUP_DIR/$FILENAME"

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME"

# Upload para S3 (opcional)
# aws s3 cp "$BACKUP_DIR/$FILENAME" s3://seu-bucket/backups/
```

Dar permissão:
```bash
chmod +x /home/dialogix/scripts/backup-db.sh
```

### 2. Configurar Cron para Backup Automático

```bash
crontab -e

# Adicionar:
0 2 * * * /home/dialogix/scripts/backup-db.sh >> /home/dialogix/logs/backup.log 2>&1
```

---

## 🚨 Troubleshooting

### Problema: Aplicação não inicia

```bash
# Verificar logs do PM2
pm2 logs dialogix-api --lines 100

# Verificar se porta está em uso
sudo lsof -i :3000

# Reiniciar PM2
pm2 restart all
```

### Problema: Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U dialogix -d dialogix_crm

# Verificar configurações no .env
cat backend/.env | grep DB_
```

### Problema: Alto uso de memória

```bash
# Ver uso de memória
pm2 status

# Reiniciar app específico
pm2 restart dialogix-api

# Aumentar limite de memória
pm2 start ecosystem.config.js --max-memory-restart 2G
```

### Problema: WebSocket não conecta

```bash
# Verificar logs do WebSocket
pm2 logs dialogix-websocket

# Verificar configuração do Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Testar WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3001/socket.io/
```

---

## 📈 Otimizações de Performance

### 1. Configurar Swap (se necessário)

```bash
# Criar arquivo swap de 4GB
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Tornar permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Otimizar PostgreSQL

Editar `/etc/postgresql/15/main/postgresql.conf`:

```conf
# Ajustar para seu hardware
shared_buffers = 2GB              # 25% da RAM
effective_cache_size = 6GB        # 75% da RAM
maintenance_work_mem = 512MB
work_mem = 16MB
max_connections = 100

# Otimizações
random_page_cost = 1.1            # Para SSDs
effective_io_concurrency = 200    # Para SSDs
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### 3. Configurar Redis para Persistência

Editar `/etc/redis/redis.conf`:

```conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

Reiniciar Redis:
```bash
sudo systemctl restart redis-server
```

---

## 🔒 Segurança

### 1. Configurar Fail2Ban

```bash
sudo apt install -y fail2ban

# Copiar configuração padrão
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Habilitar
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Desabilitar Login SSH por Senha

Editar `/etc/ssh/sshd_config`:

```conf
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

Reiniciar SSH:
```bash
sudo systemctl restart sshd
```

### 3. Atualizar Sistema Regularmente

```bash
# Criar script de atualização
cat > /home/dialogix/scripts/update.sh << 'EOF'
#!/bin/bash
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y
EOF

chmod +x /home/dialogix/scripts/update.sh

# Agendar para rodar semanalmente
crontab -e
# Adicionar:
0 3 * * 0 /home/dialogix/scripts/update.sh >> /home/dialogix/logs/update.log 2>&1
```

---

## ✅ Checklist de Deploy

- [ ] VPS configurada com Ubuntu 22.04
- [ ] Node.js 20 LTS instalado
- [ ] PostgreSQL 15 instalado e configurado
- [ ] Redis instalado e rodando
- [ ] Nginx instalado e configurado
- [ ] PM2 instalado globalmente
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Dependências instaladas (backend + frontend)
- [ ] Build gerado (backend + frontend)
- [ ] Migrations executadas
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado com proxy reverso
- [ ] SSL configurado com Let's Encrypt
- [ ] Firewall configurado (UFW)
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Health check funcionando
- [ ] WebSocket conectando
- [ ] CI/CD configurado (opcional)

---

## 📚 Recursos Adicionais

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação PM2](https://pm2.keymetrics.io/docs)
- [Documentação Nginx](https://nginx.org/en/docs)
- [PostgreSQL Tuning](https://pgtune.leopard.in.ua)

---

**Última Atualização**: 11 de Fevereiro de 2025
