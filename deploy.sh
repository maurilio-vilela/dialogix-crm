#!/bin/bash

# Script de Deploy - Dialogix CRM (Produção com Traefik)
# Uso: ./deploy.sh

echo "🚀 Iniciando deploy do Dialogix CRM..."
echo ""

# 1. Git Pull
echo "📥 Atualizando código do repositório..."
git pull origin main
echo "✅ Código atualizado!"
echo ""

# 2. Rebuild (sem cache para garantir atualização)
echo "🔨 Reconstruindo imagens Docker..."
docker compose -f docker-compose.traefik.yml build --no-cache backend frontend
echo "✅ Imagens reconstruídas!"
echo ""

# 3. Subir containers (usando arquivo TRAEFIK com overlay network)
echo "🚀 Iniciando containers (com Traefik)..."
docker compose -f docker-compose.traefik.yml up -d
echo "✅ Containers iniciados!"
echo ""

# 4. Aguardar inicialização (garantir que serviços essenciais subiram)
echo "⏳ Aguardando inicialização dos serviços..."
sleep 5
echo ""

# 5. Garantir inicialização (segunda verificação)
echo "⏳ Garantindo que serviços estão rodando..."
sleep 5
echo ""

# 6. Status
echo "📊 Status dos containers:"
docker compose -f docker-compose.traefik.yml ps
echo ""

# 7. Logs (últimas 20 linhas)
echo "📋 Últimos logs:"
docker compose -f docker-compose.traefik.yml logs --tail=20
echo ""

echo "✅ Deploy concluído com sucesso!"
echo "A aplicação foi atualizada e está pronta para testes."
echo ""
echo "🌐 Acessar (Produção com Domínios):"
echo "   Frontend: https://dev.dialogix.com.br"
echo "   Backend API: https://api-dev.dialogix.com.br"
echo "   API Docs: https://api-dev.dialogix.com.br/api/docs"
echo ""
echo "💡 Nota: Este script usa docker-compose.traefik.yml (rede overlay com Traefik)"
