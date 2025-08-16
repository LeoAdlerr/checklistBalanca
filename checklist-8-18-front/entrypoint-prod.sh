#!/bin/sh
set -e

echo "✅ Frontend: Build concluido, iniciando servidor Nginx de produção..."
# O 'exec' substitui o processo atual pelo Nginx, garantindo
# que ele seja o processo principal do contêiner.
exec nginx -g 'daemon off;'