#!/bin/bash

# Script de Deploy - Dialogix CRM (Produção Docker Swarm + Traefik)
# Uso: ./deploy.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Dialogix CRM (Docker Swarm)..."
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

# 3. Deploy no Swarm
echo "🚀 Implantando stack no Docker Swarm..."
docker stack deploy -c docker-compose.traefik.yml dialogix-crm
echo "✅ Stack implantada!"
echo ""

# 4. Aguardar inicialização
echo "⏳ Aguardando inicialização dos serviços..."
sleep 10
echo ""

# 5. Status dos serviços
echo "📊 Status dos serviços (Swarm):"
docker service ls | grep dialogix
echo ""

# 6. Status detalhado de cada serviço
echo "📊 Status detalhado:"
echo ""
echo "Backend:"
docker service ps dialogix-crm_backend --no-trunc | head -5
echo ""
echo "Frontend:"
docker service ps dialogix-crm_frontend --no-trunc | head -5
echo ""

# 7. Logs recentes
echo "📋 Últimos logs do Backend:"
docker service logs dialogix-crm_backend --tail=15
echo ""
echo "📋 Últimos logs do Frontend:"
docker service logs dialogix-crm_frontend --tail=15
echo ""

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Acessos:"
echo "   Frontend: https://dev.dialogix.com.br"
echo "   Backend API: https://api-dev.dialogix.com.br"
echo "   API Docs: https://api-dev.dialogix.com.br/api/docs"
echo ""
echo "📋 Comandos úteis:"
echo "   docker service ls | grep dialogix                    # Listar serviços"
echo "   docker service logs dialogix-crm_backend --tail 50   # Logs do backend"
echo "   docker service logs dialogix-crm_frontend --tail 50  # Logs do frontend"
echo "   docker service ps dialogix-crm_backend               # Status do backend"
echo ""
echo "💡 Stack: dialogix-crm (Docker Swarm + Traefik)"
