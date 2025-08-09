#!/bin/sh

# Para o script imediatamente se qualquer comando falhar.
set -e

echo "Aguardando MySQL usando wait-for-it.sh..."
./wait-for-it.sh db:3306 --timeout=90 --strict -- echo "MySQL está pronto!"

echo "Compilando a aplicação..."
yarn build

echo "Iniciando a aplicação em background para os testes..."
# Executa a aplicação compilada em segundo plano e guarda o seu ID de processo (PID)
node dist/main &
SERVER_PID=$!

# Armadilha (trap): Garante que o servidor em background seja finalizado
# quando o script terminar, seja por sucesso ou por falha.
trap 'kill $SERVER_PID' EXIT

echo "Aguardando a aplicação iniciar para os testes..."
# Pequena pausa para garantir que o servidor esteja pronto para receber conexões.
sleep 5 

echo "Executando testes unitários..."
yarn test

echo "Executando testes E2E..."
yarn test:e2e

echo "Testes OK! Iniciando aplicação..."
exec yarn start:dev