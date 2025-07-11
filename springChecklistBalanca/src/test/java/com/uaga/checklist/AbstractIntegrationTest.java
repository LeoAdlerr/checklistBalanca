package com.uaga.checklist;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

// Esta anotação gerencia o ciclo de vida dos contêineres declarados com @Container.
@Testcontainers
public abstract class AbstractIntegrationTest {

    @Container
    // CORREÇÃO: Usando a imagem padrão do MySQL e aplicando o script de inicialização.
    // Isso é mais limpo, mais rápido e evita problemas de compilação.
    // O Testcontainers encontrará 'init.sql' no classpath de teste (src/test/resources).
    public static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.0.29")
            .withInitScript("init.sql");

    @DynamicPropertySource
    // Este método estático pode agora acessar o contêiner estático sem erros de compilação.
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysqlContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mysqlContainer::getUsername);
        registry.add("spring.datasource.password", mysqlContainer::getPassword);
    }
}
