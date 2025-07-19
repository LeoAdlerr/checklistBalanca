#!/bin/sh
set -e

echo "📦 Frontend: Instalando dependências com lockfile..."
yarn install --frozen-lockfile

echo "🧪 Frontend: Executando testes unitários..."
yarn test:unit

echo "--------------------------------------------------"
echo "🔍 Cypress: Verificando a versão instalada..."
yarn cypress --version || echo "⚠️ Cypress não está instalado corretamente"
echo "--------------------------------------------------"

echo "🚀 Frontend: Executando testes E2E..."
yarn test:e2e

echo "✅ Frontend: Testes concluídos. Iniciando servidor de desenvolvimento..."
exec yarn start:dev
