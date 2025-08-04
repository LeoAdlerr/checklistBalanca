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

# Se chegamos até aqui, todos os testes passaram.
echo "-------------------------------------"
echo "Todos os testes passaram com sucesso!"
echo "-------------------------------------"

# A 'trap' no EXIT iria derrubar o servidor agora que o script está terminando.
# Nós não queremos isso, pois os testes passaram. Então, removemos a trap.
trap - EXIT

# Derrubamos o servidor que rodou em background para os testes.
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null || true # 'wait' espera o processo terminar. O resto é para evitar mensagens de erro.

echo "Reiniciando a aplicação no modo de desenvolvimento..."
# 'exec' substitui o processo do script pelo da aplicação.
# Isso torna o 'yarn start:dev' o processo principal do container.
exec yarn start:dev