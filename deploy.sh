#!/bin/bash

# Script de Deploy - Dialogix CRM
# Uso: ./deploy.sh

set -e  # Para na primeira falha

echo "🚀 Iniciando deploy do Dialogix CRM..."
echo ""

# 1. Git Pull
echo "📥 Atualizando código do repositório..."
git pull origin main
echo "✅ Código atualizado!"
echo ""

# 2. Rebuild (sem cache para garantir atualização)
echo "🔨 Reconstruindo imagens Docker..."
docker compose build --no-cache backend frontend
echo "✅ Imagens reconstruídas!"
echo ""

# 3. Subir containers
echo "🚀 Iniciando containers..."
docker compose up -d --force-recreate --no-deps backend frontend
echo "✅ Containers iniciados!"
echo ""

# 4. Aguardar inicialização
echo "⏳ Aguardando inicialização dos serviços..."
sleep 10
echo ""

# 5. Status
echo "📊 Status dos containers:"
docker compose ps
echo ""

# 6. Aguardar inicialização novamente (garantir que tudo está rodando)
echo "⏳ Garantindo que serviços estão rodando..."
sleep 5
echo ""

# 7. Logs (últimas 20 linhas)
echo "📋 Últimos logs:"
docker compose logs --tail=20
echo ""

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Acessar (Produção com Domínios):"
echo "   Frontend: https://dev.dialogix.com.br"
echo "   Backend API: https://api-dev.dialogix.com.br"
echo "   API Docs: https://api-dev.dialogix.com.br/api/docs"
echo ""
echo "📝 Para ver logs em tempo real:"
echo "   docker compose logs -f"
echo ""
echo "💡 Nota: Se estiver usando docker-compose.dev.yml:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3000"
