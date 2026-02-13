#!/bin/bash

# Script de Deploy - APENAS APLICAÇÃO (backend/frontend)
# Uso: ./deploy-app-only.sh
# Este script NÃO irá parar/reiniciar a infraestrutura (Traefik, DB, Redis).

set -e # Para na primeira falha

echo "🚀 Iniciando deploy APENAS da aplicação Dialogix CRM..."
echo "⚠️  Este script NÃO irá parar/reiniciar a infraestrutura (Traefik, DB, Redis)."
echo ""

# 1. Git Pull
echo "📥 Atualizando código do repositório..."
git pull origin main
echo "✅ Código atualizado!"
echo ""

# 2. Rebuild (APENAS backend e frontend)
echo "🔨 Reconstruindo imagens Docker para backend e frontend..."
docker compose build --no-cache backend frontend
echo "✅ Imagens da aplicação reconstruídas!"
echo ""

# 3. Subir containers (APENAS backend e frontend)
# --no-deps: Não inicia serviços linkados (postgres, redis)
# --force-recreate: Força a recriação dos containers com a nova imagem
echo "🚀 Reiniciando containers da aplicação (backend e frontend)..."
docker compose up -d --force-recreate --no-deps backend frontend
echo "✅ Containers da aplicação reiniciados!"
echo ""

# 4. Limpar imagens antigas (dangling)
echo "🧹 Limpando imagens Docker antigas..."
docker image prune -f
echo "✅ Limpeza concluída!"
echo ""

# 5. Status
echo "📊 Status dos containers:"
docker compose ps
echo ""

echo "✅ Deploy da aplicação concluído com sucesso!"
echo "A aplicação foi atualizada e está pronta para testes."
