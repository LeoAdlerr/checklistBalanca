# Usa a imagem oficial do MySQL como base
FROM mysql:8.0

# Copia o script de inicialização para o diretório padrão que o MySQL
# executa ao criar o banco pela primeira vez.
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql

# Expõe a porta padrão do MySQL
EXPOSE 3306