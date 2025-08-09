#!/bin/sh

set -e

echo "Aguardando MySQL usando wait-for-it.sh..."
./wait-for-it.sh db:3306 --timeout=90 --strict -- echo "MySQL está pronto!"

echo "Executando testes unitários..."
yarn test

echo "Executando testes E2E..."
yarn test:e2e

echo "Testes OK! Iniciando aplicação..."
exec yarn start:dev