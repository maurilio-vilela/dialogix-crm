# 🌐 Configuração Automática de DNS via Cloudflare API

## 📋 Pré-requisitos

### 1. Obter API Token da Cloudflare

**Passo a passo:**
1. Acesse: https://dash.cloudflare.com/profile/api-tokens
2. Clique em **"Create Token"**
3. Use o template **"Edit zone DNS"**
4. **Zone Resources:**
   - Zone: `dialogix.com.br`
   - Permissions: Zone.DNS = Edit
5. Copie o token gerado

### 2. Obter Zone ID

**Opção 1 - Via Dashboard:**
1. Acesse: https://dash.cloudflare.com
2. Clique no domínio `dialogix.com.br`
3. Na sidebar direita, copie o **Zone ID**

**Opção 2 - Via Script:**
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones?name=dialogix.com.br" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" | jq -r '.result[0].id'
```

---

## 🚀 Como Usar o Script

### Instalação de Dependências

```bash
# Instalar jq (JSON processor)
apt install -y jq

# Ou no macOS
brew install jq
```

### Configurar Variáveis de Ambiente

```bash
# Exportar credenciais Cloudflare
export CLOUDFLARE_API_TOKEN="seu_token_cloudflare_aqui"
export CLOUDFLARE_ZONE_ID="seu_zone_id_aqui"

# IP do servidor (detectar automaticamente ou manual)
export SERVER_IP=$(curl -s ifconfig.me)
# Ou manualmente:
# export SERVER_IP="123.45.67.89"
```

### Executar Script

```bash
cd /root/.openclaw/workspace/dialogix-crm
chmod +x scripts/configure-dns.sh
./scripts/configure-dns.sh
```

**Menu interativo:**
```
Escolha o ambiente para configurar:
1) Desenvolvimento (dev + api-dev)
2) Staging (staging + api-staging)
3) Produção V2 (v2 + api-v2)
4) Todos os ambientes

Opção [1-4]: 1
```

---

## 🔧 Configuração Manual (alternativa)

### Via API Cloudflare diretamente:

**Criar registro dev.dialogix.com.br:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "dev",
    "content": "SEU_IP_SERVIDOR",
    "ttl": 1,
    "proxied": true
  }'
```

**Criar registro api-dev.dialogix.com.br:**
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "A",
    "name": "api-dev",
    "content": "SEU_IP_SERVIDOR",
    "ttl": 1,
    "proxied": true
  }'
```

---

## ✅ Verificar Configuração

### Verificar propagação DNS:

```bash
# Dev
dig dev.dialogix.com.br +short
dig api-dev.dialogix.com.br +short

# Staging
dig staging.dialogix.com.br +short
dig api-staging.dialogix.com.br +short

# Prod V2
dig v2.dialogix.com.br +short
dig api-v2.dialogix.com.br +short
```

### Listar todos os registros DNS:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?per_page=100" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" | jq -r '.result[] | "\(.name) → \(.content)"'
```

### Deletar um registro (se necessário):

```bash
# Primeiro, obter o ID do registro
RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=dev.dialogix.com.br" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq -r '.result[0].id')

# Deletar
curl -X DELETE "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
```

---

## 🔐 Segurança

### Armazenar credenciais de forma segura:

**Opção 1 - Arquivo .env (não commitar!):**
```bash
# Criar arquivo .env.cloudflare
cat > .env.cloudflare << 'EOF'
CLOUDFLARE_API_TOKEN=seu_token_aqui
CLOUDFLARE_ZONE_ID=seu_zone_id_aqui
SERVER_IP=seu_ip_servidor
EOF

# Proteger arquivo
chmod 600 .env.cloudflare

# Carregar antes de rodar script
source .env.cloudflare
./scripts/configure-dns.sh
```

**Opção 2 - Docker secrets (produção):**
```bash
# Criar secrets
echo "seu_token_aqui" | docker secret create cf_api_token -
echo "seu_zone_id_aqui" | docker secret create cf_zone_id -
```

**Adicionar ao .gitignore:**
```bash
echo ".env.cloudflare" >> .gitignore
```

---

## 📊 Recursos Adicionais da API

### Listar zones:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq
```

### Obter analytics:
```bash
curl -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/analytics/dashboard" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" | jq
```

### Purge cache:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

---

## 🆘 Troubleshooting

### Erro: "Authentication error"
- Verifique se o token está correto
- Verifique se o token tem permissão de Zone.DNS Edit

### Erro: "Zone not found"
- Verifique o ZONE_ID
- Confirme que o domínio está na sua conta Cloudflare

### DNS não propaga
- Aguarde até 5 minutos
- Limpe cache DNS local: `sudo systemd-resolve --flush-caches`
- Use DNS público para testar: `dig @8.8.8.8 dev.dialogix.com.br`

### Script não encontra jq
```bash
# Ubuntu/Debian
apt install -y jq

# CentOS/RHEL
yum install -y jq

# macOS
brew install jq
```

---

## 📚 Documentação Oficial

- Cloudflare API Docs: https://developers.cloudflare.com/api/
- DNS Records API: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-create-dns-record

---

**Criado por:** Lúcia 💡  
**Data:** 2026-02-12  
**Status:** ✅ Pronto para automação DNS
