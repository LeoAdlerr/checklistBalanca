#!/bin/sh

# Para o script imediatamente se qualquer comando falhar
set -e

echo "Frontend: Instalando dependências..."
yarn install

echo "Frontend: Executando testes unitários..."
yarn test:unit

echo "Frontend: Testes OK! Iniciando servidor de desenvolvimento..."
# Usa o comando que configuramos no package.json para iniciar o Vite
exec yarn start:dev