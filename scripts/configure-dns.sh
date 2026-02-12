#!/bin/bash
# Script de Configuração Automática DNS - Cloudflare API
# Dialogix CRM - Subdomínios Dev/Staging/Prod

set -e

echo "🌐 Configurador Automático de DNS - Cloudflare"
echo "=============================================="
echo ""

# Variáveis (configurar antes de rodar)
CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}"
DOMAIN="dialogix.com.br"
SERVER_IP="${SERVER_IP}"

# Validação
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ ERRO: CLOUDFLARE_API_TOKEN não definida!"
    echo "Configure: export CLOUDFLARE_API_TOKEN='seu_token_aqui'"
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "❌ ERRO: CLOUDFLARE_ZONE_ID não definida!"
    echo "Configure: export CLOUDFLARE_ZONE_ID='seu_zone_id_aqui'"
    exit 1
fi

if [ -z "$SERVER_IP" ]; then
    echo "❌ ERRO: SERVER_IP não definida!"
    echo "Configure: export SERVER_IP='seu_ip_servidor'"
    exit 1
fi

# Função para criar/atualizar registro DNS
create_dns_record() {
    local subdomain=$1
    local ip=$2
    local proxied=${3:-false}
    
    echo "📍 Configurando: ${subdomain}.${DOMAIN} → ${ip}"
    
    # Verificar se registro já existe
    existing=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?type=A&name=${subdomain}.${DOMAIN}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
    
    if [ -n "$existing" ]; then
        echo "   ↻ Registro existente encontrado, atualizando..."
        response=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${existing}" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"${subdomain}\",\"content\":\"${ip}\",\"ttl\":1,\"proxied\":${proxied}}")
    else
        echo "   + Criando novo registro..."
        response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"A\",\"name\":\"${subdomain}\",\"content\":\"${ip}\",\"ttl\":1,\"proxied\":${proxied}}")
    fi
    
    success=$(echo $response | jq -r '.success')
    if [ "$success" == "true" ]; then
        echo "   ✅ Sucesso!"
    else
        echo "   ❌ Erro: $(echo $response | jq -r '.errors[0].message')"
    fi
}

# Menu de opções
echo "Escolha o ambiente para configurar:"
echo "1) Desenvolvimento (dev + api-dev)"
echo "2) Staging (staging + api-staging)"
echo "3) Produção V2 (v2 + api-v2)"
echo "4) Todos os ambientes"
echo ""
read -p "Opção [1-4]: " option

case $option in
    1)
        echo ""
        echo "🔧 Configurando ambiente de DESENVOLVIMENTO"
        echo ""
        create_dns_record "dev" "$SERVER_IP" true
        create_dns_record "api-dev" "$SERVER_IP" true
        ;;
    2)
        echo ""
        echo "🔧 Configurando ambiente de STAGING"
        echo ""
        create_dns_record "staging" "$SERVER_IP" true
        create_dns_record "api-staging" "$SERVER_IP" true
        ;;
    3)
        echo ""
        echo "🔧 Configurando ambiente de PRODUÇÃO V2"
        echo ""
        create_dns_record "v2" "$SERVER_IP" true
        create_dns_record "api-v2" "$SERVER_IP" true
        ;;
    4)
        echo ""
        echo "🔧 Configurando TODOS os ambientes"
        echo ""
        create_dns_record "dev" "$SERVER_IP" true
        create_dns_record "api-dev" "$SERVER_IP" true
        create_dns_record "staging" "$SERVER_IP" true
        create_dns_record "api-staging" "$SERVER_IP" true
        create_dns_record "v2" "$SERVER_IP" true
        create_dns_record "api-v2" "$SERVER_IP" true
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
echo "✅ Configuração DNS concluída!"
echo ""
echo "⏱️  Aguarde alguns minutos para propagação DNS"
echo "🔍 Verificar: dig dev.dialogix.com.br"
echo ""
