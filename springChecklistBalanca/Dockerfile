# Usa a imagem oficial do MySQL 8.0 como base.
# Esta imagem já vem com o MySQL pré-instalado e configurado para aceitar variáveis de ambiente
# como MYSQL_ROOT_PASSWORD e MYSQL_DATABASE para a configuração inicial.
FROM mysql:8.0

# Define o autor ou a equipe que mantém esta imagem (opcional, mas boa prática).
LABEL maintainer="Leonardo Adler <leonardo.silva@uaga.com.br>"

# Copia o script de inicialização do SQL para o diretório de entrada do MySQL.
# O diretório /docker-entrypoint-initdb.d/ é um local especial onde o MySQL
# executa scripts .sql e .sh automaticamente na primeira vez que o contêiner é iniciado.
# Isso garante que seu esquema de banco de dados e dados iniciais sejam criados.
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# O CMD e ENTRYPOINT da imagem base do MySQL já cuidam de iniciar o servidor MySQL.
# Não precisamos adicioná-los aqui, a menos que queiramos sobrescrever o comportamento padrão.
# Para este caso, o comportamento padrão é o ideal.

# Expõe a porta padrão do MySQL. Embora não seja estritamente necessário no Dockerfile
# para que o Podman a use, é uma boa prática documentar qual porta o serviço usa.
EXPOSE 3306

# Uma descrição simples do que esta imagem faz.
CMD ["mysqld"]