#!/bin/sh
set -e

# Esperar o backend
echo "⏳ Aguardando Backend na porta 8888..."
./wait-for-it.sh backend-prod:8888 --timeout=90 --strict -- echo "✅ Backend está pronto!"

# Instalar dependências
echo "📦 Frontend: Instalando dependências com lockfile..."
yarn install --frozen-lockfile

# Rodar testes unitários
echo "🧪 Frontend: Executando testes unitários..."
yarn test:unit

# Rodar testes E2E
echo "🚀 Frontend: Executando testes E2E..."
yarn test:e2e

# Iniciar servidor
echo "✅ Frontend: Testes concluídos. Iniciando servidor de desenvolvimento..."
exec yarn start:dev
