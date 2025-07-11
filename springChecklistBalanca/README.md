# 🚢 Projeto Checklist Alfandegário (Backend)

![Java](https://img.shields.io/badge/Java-17-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)
![Maven](https://img.shields.io/badge/Maven-3.6%2B-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![Testcontainers](https://img.shields.io/badge/Testcontainers-✓-2496ED?logo=testcontainers)
![iText](https://img.shields.io/badge/iText%207-PDF-orange)

---

## 🚀 Visão Geral

Este projeto consiste no backend de uma aplicação web robusta para o gerenciamento de checklists de inspeção alfandegária, especificamente o modelo 8/18. A API foi desenvolvida seguindo os princípios de TDD (Test-Driven Development) e uma arquitetura em camadas, garantindo um código limpo, manutenível e extensivamente testado. O sistema foi projetado para digitalizar e otimizar o processo de inspeção, que atualmente é manual, proporcionando maior eficiência, segurança e rastreabilidade dos dados.

---

## ✨ Funcionalidades Implementadas

O backend atualmente suporta o ciclo de vida completo (CRUD) de um checklist, além de funcionalidades de relatório e busca, com as seguintes regras de negócio:

* **Criação de Checklists (`POST`):** Permite iniciar uma nova inspeção com dados iniciais e validações.
* **Leitura de Checklists (`GET`):**
    * Recuperação de todos os checklists.
    * Recuperação de um checklist específico por ID.
    * Busca de checklists por um intervalo de datas de início.
* **Atualização de Checklists (`PUT`):**
    * Permite a adição incremental de itens de verificação.
    * Valida as condições para a finalização de um checklist (ex: todos os 18 pontos devem estar preenchidos e com status "Conforme" ou "N/A").
* **Deleção de Checklists (`DELETE`):**
    * Permite a exclusão de checklists que ainda não foram finalizados.
    * Bloqueia a exclusão de checklists já concluídos para garantir a integridade do histórico.
* **Geração de Relatórios (`GET`):**
    * Geração de um relatório em formato PDF para um checklist específico, desde que todos os 18 pontos tenham sido preenchidos.
* **Tratamento de Erros:** Implementação de um manipulador global de exceções para fornecer respostas de erro claras e padronizadas.

---

## ⚙️ Tecnologias Utilizadas

* **Linguagem:** Java 17
* **Framework:** Spring Boot 3.2.5
* **Persistência de Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** MySQL
* **Validação:** Spring Boot Validation (Jakarta Bean Validation)
* **Documentação da API:** Springdoc OpenAPI (Swagger UI)
* **Geração de PDF:** iText 7
* **Build e Gerenciamento de Dependências:** Apache Maven
* **Utilitários:** Project Lombok

---

## 🏗️ Arquitetura

O backend foi estruturado em uma arquitetura em camadas para separar as responsabilidades e promover um baixo acoplamento entre os componentes:

-   **`Controller`**: A camada de entrada da API. Responsável por expor os endpoints REST, receber as requisições HTTP e retornar as respostas. Ela delega a lógica de negócio para a camada de Serviço.
-   **`Service`**: O coração da aplicação. Contém toda a lógica de negócio, regras de validação complexas e a orquestração das operações, chamando a camada de Repositório para interagir com o banco de dados.
-   **`Repository`**: A camada de acesso a dados. Utiliza interfaces do Spring Data JPA para abstrair as operações de banco de dados (CRUD, buscas customizadas, etc.).
-   **`Entity`**: As classes que representam as tabelas do banco de dados, anotadas com JPA para o mapeamento objeto-relacional (ORM).
-   **`DTO` (Data Transfer Object)**: Objetos simples usados para transferir dados entre as camadas e, principalmente, como contratos de entrada e saída da API, evitando a exposição das entidades de domínio.
-   **`Exception`**: Pacote contendo o `GlobalExceptionHandler`, que centraliza o tratamento de erros e formata as respostas HTTP de erro.

---

## 🧪 Estratégia de Testes

O projeto foi desenvolvido com uma forte cultura de testes, seguindo os princípios de TDD e utilizando uma pirâmide de testes para garantir a qualidade em diferentes níveis:

* **Testes de Unidade:** Focados em testar a lógica de negócio da camada de **Serviço** (`ChecklistServiceImplTest`) de forma isolada, usando **Mockito** para simular o comportamento dos repositórios.
* **Testes de Slice/Integração da Camada Web:** Focados em testar a camada de **Controller** (`ChecklistControllerTest`) com `@WebMvcTest`. Eles validam os endpoints, a serialização JSON e o tratamento de requisições, mockando a camada de serviço.
* **Testes End-to-End (E2E):** O nível mais alto de teste (`ChecklistE2ETest`). Utiliza **Testcontainers** para iniciar um banco de dados MySQL real em um contêiner Docker, permitindo testar o fluxo completo da aplicação, desde a requisição HTTP até a persistência no banco de dados.

---

## 🕹️ Endpoints da API

A documentação interativa da API está disponível via Swagger UI no endpoint `/api/swagger-ui.html` quando a aplicação está em execução.

| Método   | Endpoint                      | Descrição                                               |
| :------- | :---------------------------- | :-------------------------------------------------------- |
| `POST`   | `/api/checklists`             | Cria um novo checklist.                                   |
| `GET`    | `/api/checklists`             | Retorna todos os checklists.                              |
| `GET`    | `/api/checklists/{id}`        | Retorna um checklist específico pelo ID.                  |
| `GET`    | `/api/checklists/search`      | Busca checklists por intervalo de datas (`startDate`, `endDate`). |
| `PUT`    | `/api/checklists/{id}`        | Atualiza um checklist existente.                          |
| `DELETE` | `/api/checklists/{id}`        | Deleta um checklist não finalizado.                       |
| `GET`    | `/api/checklists/{id}/pdf`    | Gera um relatório em PDF do checklist.                    |

---

## 🏁 Como Executar o Projeto

### Pré-requisitos

* JDK 17 ou superior
* Apache Maven 3.6+
* MySQL Server (para execução local) ou Docker/Podman (para os testes E2E)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <url_do_repositorio>
    cd checklist-alfandegario
    ```

2.  **Configure o Banco de Dados:**
    -   Crie um banco de dados MySQL.
    -   Abra o arquivo `src/main/resources/application.properties` e atualize as seguintes propriedades com suas credenciais:
        ```properties
        spring.datasource.url=jdbc:mysql://localhost:3306/seu_banco
        spring.datasource.username=seu_usuario
        spring.datasource.password=sua_senha
        ```

3.  **Execute o script de inicialização do banco:**
    -   Rode o script `init.sql` no seu banco de dados para criar as tabelas e inserir os dados de lookup iniciais.

4.  **Compile e execute a aplicação:**
    ```bash
    mvn spring-boot:run
    ```

A aplicação estará disponível em `http://localhost:8888`.
