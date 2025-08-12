<div align="center">
  <a href="https://www.mysql.com/" target="blank"><img src="https://www.mysql.com/common/logos/logo-mysql-170x115.png" width="150" alt="MySQL Logo"></a>
  <h1 align="center">Documentação do Banco de Dados - Inspeção Digital 8/18</h1>
  <p align="center">
    <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0">
    <img src="https://img.shields.io/badge/Schema-3ª_Forma_Normal-28A745?style=for-the-badge" alt="Schema em 3FN">
    <img src="https://img.shields.io/badge/Status-Estável-blue?style=for-the-badge" alt="Status Estável">
  </p>
</div>

<p>
  Este documento fornece uma visão técnica detalhada do schema do banco de dados MySQL que serve como a camada de persistência para a Aplicação de Inspeção Digital 8/18.
</p>

<hr>

<h2>📜 Sumário</h2>
<ul>
  <li><a href="#proposito-e-tecnologia">Propósito e Tecnologia</a></li>
  <li><a href="#como-executar-o-banco-de-dados-isoladamente">Como Executar Isoladamente</a></li>
  <li><a href="#modelo-de-entidade-relacionamento-mer">Modelo de Entidade-Relacionamento (MER)</a></li>
  <li><a href="#normalizacao-e-decisoes-de-design">Normalização e Decisões de Design</a></li>
  <li><a href="#dicionario-de-dados-completo">Dicionário de Dados Completo</a></li>
  <li><a href="#script-de-inicializacao-initsql">Script de Inicialização (init.sql)</a></li>
  <li><a href="#estrategia-de-migracoes-schema-evolution">Estratégia de Migrações (Evolução do Schema)</a></li>
</ul>

<hr>

<h2 id="proposito-e-tecnologia">💡 Propósito e Tecnologia</h2>
<p>
  O propósito deste banco de dados é armazenar de forma segura, estruturada e relacional todos os dados gerados pelo processo de inspeção.
</p>
<p>
  A escolha da tecnologia inicial foi uma <strong>decisão pragmática e estratégica</strong>. O <strong>MySQL 8.0</strong> foi selecionado por ser uma tecnologia robusta, com vasto suporte e, crucialmente, por já fazer parte da infraestrutura existente na Universal Armazéns. Esta decisão, tomada em alinhamento com a equipe, permitiu aproveitar os recursos e o conhecimento já disponíveis, acelerando a implantação.
</p>
<p>
  No entanto, o mais importante é a filosofia de design da aplicação: <strong>a tecnologia específica do banco de dados é tratada como um detalhe de implementação</strong>. Graças à robusta camada de abstração de dados no backend, construída com o ORM <strong>TypeORM</strong>, a aplicação não está fortemente acoplada ao MySQL. Isto significa que, no futuro, se for necessário ou oportuno, o sistema pode ser migrado para outro banco de dados relacional (como o SQL Server, também já existente na empresa, ou PostgreSQL) com um esforço mínimo, sem impactar a lógica de negócio da aplicação.
</p>

<h2 id="como-executar-e-interagir">🚀 Como Executar e Interagir com o Banco de Dados</h2>
<p>
  Existem múltiplas formas de interagir com este banco de dados, dependendo da sua necessidade: como parte da aplicação completa, de forma isolada para desenvolvimento do backend, ou até mesmo num servidor MySQL já existente.
</p>
<h3>Opção 1: Execução via Contêiner (Recomendado)</h3>
<h4>A) Como parte do Stack Completo</h4>
<p>
  A partir da <strong>pasta raiz do projeto</strong> (<code>/checklistBalanca</code>), utilize o seguinte comando para subir apenas o serviço do banco de dados:
</p>
<pre><code># Para Docker:
docker compose up -d db

# Para Podman

podman-compose up -d db</code></pre>
<h4>B) De Forma Totalmente Isolada</h4>
<p>
  Para DBAs ou desenvolvedores que clonaram apenas este repositório.
</p>
<ol>
    <li>Navegue até esta pasta: <pre><code>cd checklist-8-18-bd</code></pre></li>
    <li>Execute o comando de subida: <pre><code>podman-compose up --build -d</code></pre> (ou <code>docker-compose</code>)</li>
</ol>
<p>
  Em ambos os casos, um contêiner do MySQL estará acessível em <code>localhost:3306</code>.
</p>
<h3>Opção 2: Usando um Servidor MySQL Existente</h3>
<ol>
  <li>Garanta que o seu servidor MySQL está em execução.</li>
  <li>Execute o script <strong><code>init.sql</code></strong> deste repositório no seu servidor para criar e popular a base de dados <code>uagabd</code>.</li>
  <li>Atualize as variáveis de ambiente no ficheiro <code>.env</code> do projeto <strong>backend</strong> para apontar para o seu servidor.</li>
</ol>

<h3>🧪 Validando o Modelo com o Script de Casos de Uso</h3>
<p>
  O ficheiro <strong><code>casosDeUso.sql</code></strong> é um script de teste poderoso que simula os fluxos de usuário da aplicação (criação de inspeção aprovada, reprovada, consultas, etc.) diretamente no banco. É uma ferramenta excelente para DBAs testarem otimizações, triggers ou para validar a integridade do modelo.
</p>
<p>
  <strong>Atenção:</strong> O script assume que as tabelas transacionais estão vazias. Antes de o executar, é recomendado limpar os dados de inspeções anteriores para evitar erros de chave primária.
</p>

<h4>Script de Limpeza (Reset do Ambiente)</h4>
<p>Execute o seguinte script para apagar todos os dados de inspeções, mantendo as tabelas mestras e de lookup intactas.</p>
<pre><code>-- Desativa a verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpa as tabelas transacionais
TRUNCATE TABLE `item_evidences`;
TRUNCATE TABLE `inspection_checklist_items`;
TRUNCATE TABLE `inspections`;

-- Reativa a verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Ambiente de teste limpo com sucesso!' AS status;
</code></pre>
<p>
  Após executar a limpeza, pode rodar o script <code>casosDeUso.sql</code> com segurança.
</p>

<hr>

<h2 id="modelo-de-entidade-relacionamento-mer">📊 Modelo de Entidade-Relacionamento (MER)</h2>
<p>O diagrama a seguir ilustra a estrutura das tabelas e os seus relacionamentos. Ele foi projetado para garantir a integridade referencial e a eficiência das consultas.</p>

```mermaid
erDiagram
    INSPECTIONS {
        INT id PK
        VARCHAR inspector_name
        INT status_id FK
        VARCHAR entry_registration
        VARCHAR vehicle_plates
        VARCHAR transport_document
        INT modality_id FK
        INT operation_type_id FK
        INT unit_type_id FK
        INT container_type_id FK
        DECIMAL verified_length
        DECIMAL verified_width
        DECIMAL verified_height
        DATETIME start_datetime
        DATETIME end_datetime
        VARCHAR driver_name
        VARCHAR driver_signature_path
        VARCHAR inspector_signature_path
        VARCHAR seal_uaga_post_inspection
        VARCHAR seal_uaga_post_loading
        VARCHAR seal_shipper
        VARCHAR seal_rfb
        INT seal_verification_rfb_status_id FK
        INT seal_verification_shipper_status_id FK
        INT seal_verification_tape_status_id FK
        VARCHAR seal_verification_responsible_name
        VARCHAR seal_verification_signature_path
        DATE seal_verification_date
        TEXT observations
        TEXT action_taken
        VARCHAR generated_pdf_path
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    INSPECTION_CHECKLIST_ITEMS {
        INT id PK
        INT inspection_id FK
        INT master_point_id FK
        INT status_id FK
        TEXT observations
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ITEM_EVIDENCES {
        INT id PK
        INT item_id FK
        VARCHAR file_path
        VARCHAR file_name
        INT file_size
        VARCHAR mime_type
        TIMESTAMP created_at
    }

    MASTER_INSPECTION_POINTS {
        INT id PK
        INT point_number
        VARCHAR name
        TEXT description
        VARCHAR category
    }

    LOOKUP_STATUSES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_MODALITIES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_OPERATION_TYPES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_UNIT_TYPES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_CONTAINER_TYPES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_CHECKLIST_ITEM_STATUSES {
        INT id PK
        VARCHAR name
    }

    LOOKUP_SEAL_VERIFICATION_STATUSES {
        INT id PK
        VARCHAR name
    }

    %% Relacionamentos principais
    INSPECTIONS ||--o{ INSPECTION_CHECKLIST_ITEMS : contém
    INSPECTION_CHECKLIST_ITEMS ||--o{ ITEM_EVIDENCES : tem
    MASTER_INSPECTION_POINTS ||--o{ INSPECTION_CHECKLIST_ITEMS : ponto

    %% Relacionamentos com lookups
    LOOKUP_STATUSES ||--o{ INSPECTIONS : status
    LOOKUP_MODALITIES ||--o{ INSPECTIONS : modalidade
    LOOKUP_OPERATION_TYPES ||--o{ INSPECTIONS : tipo_op
    LOOKUP_UNIT_TYPES ||--o{ INSPECTIONS : tipo_unidade
    LOOKUP_CONTAINER_TYPES ||--o{ INSPECTIONS : tipo_container

    LOOKUP_SEAL_VERIFICATION_STATUSES ||--o{ INSPECTIONS : status_lacre_rfb
    LOOKUP_SEAL_VERIFICATION_STATUSES ||--o{ INSPECTIONS : status_lacre_shipper
    LOOKUP_SEAL_VERIFICATION_STATUSES ||--o{ INSPECTIONS : status_lacre_tape

    LOOKUP_CHECKLIST_ITEM_STATUSES ||--o{ INSPECTION_CHECKLIST_ITEMS : status_item

```

<h2 id="normalizacao-e-decisoes-de-design">📐 Normalização e Decisões de Design</h2>
<p>
O modelo de dados foi projetado seguindo as boas práticas de normalização, alcançando a <strong>Terceira Forma Normal (3FN)</strong>. As principais decisões foram:
</p>
<ul>
<li>
<strong>Uso de Tabelas de Lookup:</strong> Todas as informações categóricas (status, modalidades, tipos de unidade, etc.) foram extraídas para tabelas de <code>lookup_*</code>. Isso elimina a redundância de dados, previne anomalias de inserção/atualização e garante a consistência. Por exemplo, para adicionar um novo "Tipo de Operação", basta inserir um registo na tabela <code>lookup_operation_types</code>, sem a necessidade de alterar a aplicação.
</li>
<li>
<strong>Integridade Referencial:</strong> Todas as relações são reforçadas com chaves estrangeiras (<code>FK</code>), garantindo que um item de checklist não possa existir sem uma inspeção, ou uma evidência sem um item de checklist. A opção <code>ON DELETE CASCADE</code> foi usada estrategicamente para que, ao apagar uma inspeção, todos os seus itens e evidências associados sejam automaticamente removidos, mantendo a consistência.
</li>
<li>
<strong>Tabela Mestre (<code>master_inspection_points</code>):</strong> Os 18 pontos de inspeção, que são a base do negócio, foram definidos numa tabela mestre imutável. Isso separa a <em>definição</em> de um ponto da sua <em>execução</em> (que é registrada em <code>inspection_checklist_items</code>).
</li>
</ul>

<hr>

<h2 id="dicionario-de-dados-completo">📖 Dicionário de Dados Completo</h2>
<p>A seguir, uma descrição detalhada de cada tabela e das suas respetivas colunas.</p>

<h3>Tabelas de Lookup (Mestras)</h3>
<p>Estas tabelas contêm valores estáticos para garantir a consistência dos dados em toda a aplicação.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Tabela</th>
            <th align="left">Descrição</th>
        </tr>
    </thead>
    <tbody>
        <tr><td><code>lookup_statuses</code></td><td>Status possíveis para uma inspeção geral (ex: EM_INSPECAO, APROVADO).</td></tr>
        <tr><td><code>lookup_modalities</code></td><td>Modalidades de transporte disponíveis (ex: RODOVIARIO, MARITIMO).</td></tr>
        <tr><td><code>lookup_operation_types</code></td><td>Tipos de operação aduaneira, geralmente indicando nível de risco (ex: VERDE, VERMELHA).</td></tr>
        <tr><td><code>lookup_unit_types</code></td><td>Tipos de unidade de carga (ex: CONTAINER, BAU).</td></tr>
        <tr><td><code>lookup_container_types</code></td><td>Tipos específicos de contêineres (ex: DRY_20, REEFER_40).</td></tr>
        <tr><td><code>lookup_checklist_item_statuses</code></td><td>Status para cada item da inspeção (ex: CONFORME, NAO_CONFORME).</td></tr>
        <tr><td><code>lookup_seal_verification_statuses</code></td><td>Status para a verificação de lacres de saída (ex: OK, NAO_OK).</td></tr>
    </tbody>
</table>

<hr>

<h3>Tabelas Principais</h3>

<h4><strong><code>master_inspection_points</code></strong></h4>
<p>Tabela mestre com a definição dos 18 pontos de inspeção padrão. Esta tabela é imutável e serve como base para todos os checklists.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição / Regra de Negócio</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr><td><code>id</code></td><td>INT</td><td>PK</td><td>Não</td><td>Identificador único do ponto de inspeção.</td><td><code>5</code></td></tr>
        <tr><td><code>point_number</code></td><td>INT</td><td>UNIQUE</td><td>Não</td><td>Número oficial do ponto (1 a 18).</td><td><code>5</code></td></tr>
        <tr><td><code>name</code></td><td>VARCHAR(255)</td><td></td><td>Não</td><td>Nome resumido do ponto.</td><td><code>"PISO DO CAMINHÃO"</code></td></tr>
        <tr><td><code>description</code></td><td>TEXT</td><td></td><td>Sim</td><td>Descrição detalhada do procedimento de inspeção.</td><td><code>"Levantar o carpete..."</code></td></tr>
        <tr><td><code>category</code></td><td>VARCHAR(50)</td><td></td><td>Não</td><td>Agrupador do ponto: 'VEICULO' ou 'CONTEINER'.</td><td><code>"VEICULO"</code></td></tr>
    </tbody>
</table>

<h4><strong><code>inspections</code></strong></h4>
<p>Tabela central que armazena cada registo de inspeção, contendo todos os dados do cabeçalho do formulário.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr><th align="left">Nome da Coluna</th><th align="left">Tipo de Dado</th><th align="left">Chave</th><th align="left">Nulo?</th><th align="left">Descrição</th><th align="left">Exemplo</th></tr>
    </thead>
    <tbody>
        <tr><td><code>id</code></td><td>INT</td><td>PK</td><td>Não</td><td>ID único da inspeção (auto-incremento).</td><td><code>1001</code></td></tr>
        <tr><td><code>inspector_name</code></td><td>VARCHAR(255)</td><td></td><td>Não</td><td>Nome do inspetor responsável.</td><td><code>"Carlos Souza"</code></td></tr>
        <tr><td><code>status_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do status geral (ref. <code>lookup_statuses</code>).</td><td><code>2</code></td></tr>
        <tr><td><code>entry_registration</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Número do registo de entrada.</td><td><code>"RE-2025-099"</code></td></tr>
        <tr><td><code>vehicle_plates</code></td><td>VARCHAR(20)</td><td></td><td>Sim</td><td>Placa do veículo inspecionado.</td><td><code>"BRA2E19"</code></td></tr>
        <tr><td><code>transport_document</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Nº do documento de transporte (CTe, etc.).</td><td><code>"CTE123456"</code></td></tr>
        <tr><td><code>modality_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID da modalidade (ref. <code>lookup_modalities</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>operation_type_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do tipo de operação (ref. <code>lookup_operation_types</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>unit_type_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do tipo de unidade (ref. <code>lookup_unit_types</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>container_type_id</code></td><td>INT</td><td>FK</td><td>Sim</td><td>ID do tipo de contêiner (ref. <code>lookup_container_types</code>).</td><td><code>2</code></td></tr>
        <tr><td><code>verified_length</code></td><td>DECIMAL(10,2)</td><td></td><td>Sim</td><td>Comprimento verificado em metros.</td><td><code>12.02</code></td></tr>
        <tr><td><code>verified_width</code></td><td>DECIMAL(10,2)</td><td></td><td>Sim</td><td>Largura verificada em metros.</td><td><code>2.35</code></td></tr>
        <tr><td><code>verified_height</code></td><td>DECIMAL(10,2)</td><td></td><td>Sim</td><td>Altura verificada em metros.</td><td><code>2.69</code></td></tr>
        <tr><td><code>start_datetime</code></td><td>DATETIME</td><td></td><td>Não</td><td>Data e hora de início da inspeção.</td><td><code>"2025-08-11 14:30:00"</code></td></tr>
        <tr><td><code>end_datetime</code></td><td>DATETIME</td><td></td><td>Sim</td><td>Data e hora de finalização da inspeção.</td><td><code>"2025-08-11 15:15:00"</code></td></tr>
        <tr><td><code>driver_name</code></td><td>VARCHAR(255)</td><td></td><td>Não</td><td>Nome do motorista.</td><td><code>"José da Silva"</code></td></tr>
        <tr><td><code>driver_signature_path</code></td><td>VARCHAR(512)</td><td></td><td>Sim</td><td>Caminho para o ficheiro da assinatura do motorista.</td><td><code>"/uploads/signatures/driver_1001.png"</code></td></tr>
        <tr><td><code>inspector_signature_path</code></td><td>VARCHAR(512)</td><td></td><td>Sim</td><td>Caminho para o ficheiro da assinatura do inspetor.</td><td><code>"/uploads/signatures/inspector_1001.png"</code></td></tr>
        <tr><td><code>seal_uaga_post_inspection</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Nº do lacre UAGA pós-inspeção.</td><td><code>"UAGA1234"</code></td></tr>
        <tr><td><code>seal_uaga_post_loading</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Nº do lacre UAGA pós-carregamento.</td><td><code>"UAGA5678"</code></td></tr>
        <tr><td><code>seal_shipper</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Lacre do armador (shipper).</td><td><code>"SHIPPER321"</code></td></tr>
        <tr><td><code>seal_rfb</code></td><td>VARCHAR(100)</td><td></td><td>Sim</td><td>Lacre da Receita Federal (RFB).</td><td><code>"RFB987"</code></td></tr>
        <tr><td><code>seal_verification_rfb_status_id</code></td><td>INT</td><td>FK</td><td>Sim</td><td>Status do lacre RFB (ref. <code>lookup_seal_verification_statuses</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>seal_verification_shipper_status_id</code></td><td>INT</td><td>FK</td><td>Sim</td><td>Status do lacre Shipper (ref. <code>lookup_seal_verification_statuses</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>seal_verification_tape_status_id</code></td><td>INT</td><td>FK</td><td>Sim</td><td>Status da fita lacre (ref. <code>lookup_seal_verification_statuses</code>).</td><td><code>1</code></td></tr>
        <tr><td><code>seal_verification_responsible_name</code></td><td>VARCHAR(255)</td><td></td><td>Sim</td><td>Nome do responsável pela verificação dos lacres.</td><td><code>"Ana Souza"</code></td></tr>
        <tr><td><code>seal_verification_signature_path</code></td><td>VARCHAR(512)</td><td></td><td>Sim</td><td>Caminho para a assinatura do responsável.</td><td><code>"/uploads/signatures/verifier_1001.png"</code></td></tr>
        <tr><td><code>seal_verification_date</code></td><td>DATE</td><td></td><td>Sim</td><td>Data da verificação dos lacres de saída.</td><td><code>"2025-08-11"</code></td></tr>
        <tr><td><code>observations</code></td><td>TEXT</td><td></td><td>Sim</td><td>Observações gerais da inspeção.</td><td><code>"Veículo em bom estado."</code></td></tr>
        <tr><td><code>action_taken</code></td><td>TEXT</td><td></td><td>Sim</td><td>Providências tomadas em caso de inconformidade.</td><td><code>"N/A"</code></td></tr>
        <tr><td><code>generated_pdf_path</code></td><td>VARCHAR(512)</td><td></td><td>Sim</td><td>Caminho para o relatório PDF gerado.</td><td><code>"/reports/inspecao_1001.pdf"</code></td></tr>
        <tr><td><code>created_at</code></td><td>TIMESTAMP</td><td></td><td>Não</td><td>Timestamp da criação do registo.</td><td><code>"2025-08-11 14:30:00"</code></td></tr>
        <tr><td><code>updated_at</code></td><td>TIMESTAMP</td><td></td><td>Não</td><td>Timestamp da última atualização do registo.</td><td><code>"2025-08-11 15:15:00"</code></td></tr>
    </tbody>
</table>

<h4><strong><code>inspection_checklist_items</code></strong></h4>
<p>Tabela associativa que regista o estado de cada um dos 18 pontos para uma inspeção específica.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr><th align="left">Nome da Coluna</th><th align="left">Tipo de Dado</th><th align="left">Chave</th><th align="left">Nulo?</th><th align="left">Descrição</th><th align="left">Exemplo</th></tr>
    </thead>
    <tbody>
        <tr><td><code>id</code></td><td>INT</td><td>PK</td><td>Não</td><td>ID único do item de checklist.</td><td><code>5001</code></td></tr>
        <tr><td><code>inspection_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID da inspeção relacionada (ref. <code>inspections</code>).</td><td><code>1001</code></td></tr>
        <tr><td><code>master_point_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do ponto de inspeção (ref. <code>master_inspection_points</code>).</td><td><code>11</code></td></tr>
        <tr><td><code>status_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do status do item (ref. <code>lookup_checklist_item_statuses</code>).</td><td><code>2</code></td></tr>
        <tr><td><code>observations</code></td><td>TEXT</td><td></td><td>Sim</td><td>Observações específicas para este ponto.</td><td><code>"Pneu dianteiro direito com desgaste."</code></td></tr>
        <tr><td><code>created_at</code></td><td>TIMESTAMP</td><td></td><td>Não</td><td>Timestamp da criação do registo.</td><td><code>"2025-08-11 14:45:10"</code></td></tr>
        <tr><td><code>updated_at</code></td><td>TIMESTAMP</td><td></td><td>Não</td><td>Timestamp da última atualização do registo.</td><td><code>"2025-08-11 14:45:10"</code></td></tr>
    </tbody>
</table>

<h4><strong><code>item_evidences</code></strong></h4>
<p>Armazena os metadados das evidências (imagens) anexadas a um item de checklist.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr><th align="left">Nome da Coluna</th><th align="left">Tipo de Dado</th><th align="left">Chave</th><th align="left">Nulo?</th><th align="left">Descrição</th><th align="left">Exemplo</th></tr>
    </thead>
    <tbody>
        <tr><td><code>id</code></td><td>INT</td><td>PK</td><td>Não</td><td>ID único da evidência.</td><td><code>9001</code></td></tr>
        <tr><td><code>item_id</code></td><td>INT</td><td>FK</td><td>Não</td><td>ID do item de checklist relacionado (ref. <code>inspection_checklist_items</code>).</td><td><code>5001</code></td></tr>
        <tr><td><code>file_path</code></td><td>VARCHAR(512)</td><td></td><td>Não</td><td>Caminho relativo para o ficheiro no sistema de armazenamento.</td><td><code>"1001/11_1660234210.png"</code></td></tr>
        <tr><td><code>file_name</code></td><td>VARCHAR(255)</td><td></td><td>Não</td><td>Nome original do ficheiro enviado.</td><td><code>"foto_pneu.png"</code></td></tr>
        <tr><td><code>file_size</code></td><td>INT</td><td></td><td>Não</td><td>Tamanho do ficheiro em bytes.</td><td><code>312456</code></td></tr>
        <tr><td><code>mime_type</code></td><td>VARCHAR(100)</td><td></td><td>Não</td><td>Tipo MIME do ficheiro (ex: image/png).</td><td><code>"image/png"</code></td></tr>
        <tr><td><code>created_at</code></td><td>TIMESTAMP</td><td></td><td>Não</td><td>Timestamp do upload do ficheiro.</td><td><code>"2025-08-11 14:46:05"</code></td></tr>
    </tbody>
</table>

<hr>

<h2 id="script-de-inicializacao-initsql">⚙️ Script de Inicialização (init.sql)</h2>
<p>
O ficheiro <code>init.sql</code>, localizado neste diretório, é o ponto de partida para a criação do banco de dados. Ele contém:
</p>
<ol>
<li><strong>DDL (Data Definition Language):</strong> Todos os comandos <code>CREATE TABLE</code> para gerar o schema completo.</li>
<li><strong>DML (Data Manipulation Language):</strong> Todos os comandos <code>INSERT</code> para popular as tabelas de <code>lookup_*</code> e a <code>master_inspection_points</code> com os dados essenciais para o funcionamento da aplicação.</li>
</ol>
<p>
Este script é executado <strong>automaticamente</strong> pelo contêiner do MySQL na primeira vez que ele é inicializado, garantindo um ambiente de banco de dados consistente e pronto para uso com um único comando.
</p>

<h2 id="estrategia-de-migracoes-schema-evolution">🧬 Evolução do Schema e Governança de Dados</h2>
<p>
  A evolução do schema do banco de dados segue uma abordagem estrita e segura de <strong>"Database First"</strong>, onde o banco de dados é a única fonte da verdade. A autoridade para modificar o schema pertence ao <strong>DBA</strong>, com o auxílio e validação do <strong>Product Owner (PO)</strong>, garantindo que toda alteração tenha tanto embasamento técnico (ACID, 3FN) quanto valor de negócio.
</p>
<p>
  A configuração da aplicação backend reforça esta segurança com a diretiva <strong><code>DB_SYNCHRONIZE='false'</code></strong>, uma regra não-negociável deste projeto.
</p>

<h3>Fluxo de Trabalho para Alterações no Schema</h3>
<p>
  Qualquer alteração na estrutura do banco de dados, como adicionar uma nova coluna ou tabela, deve seguir um processo formal de governança para garantir a integridade do modelo.
</p>
<ol>
  <li>
    <strong>1. Proposta de Mudança:</strong> Um <strong>Desenvolvedor</strong> identifica a necessidade de uma alteração no schema para suportar uma nova funcionalidade e formaliza uma proposta. Alternativamente, o próprio <strong>PO</strong> pode documentar uma necessidade de negócio (ex: novo campo no dicionário de dados) e sugeri-la ao DBA.
  </li>
  <li>
    <strong>2. Análise e Aprovação Conjunta:</strong> A proposta é avaliada em duas frentes:
    <ul>
        <li>O <strong>PO</strong> valida o valor de negócio da alteração.</li>
        <li>O <strong>DBA</strong> analisa o impacto técnico, a conformidade com a 3ª Forma Normal e a performance.</li>
    </ul>
    A mudança só prossegue com o aval de ambos.
  </li>
  <li>
    <strong>3. Desenvolvimento da Migração (DBA):</strong> Após a aprovação, o <strong>DBA</strong> cria um script SQL de migração manual e versionado (ex: <code>V2__Add_inspections_priority_column.sql</code>) contendo os comandos <code>ALTER TABLE</code> necessários.
  </li>
  <li>
    <strong>4. Aplicação Controlada (DBA):</strong> O <strong>DBA</strong> é o responsável por aplicar o script de migração nos ambientes de desenvolvimento, homologação e produção, de forma controlada e em janelas de manutenção apropriadas.
  </li>
  <li>
    <strong>5. Sincronização da Aplicação (Desenvolvedor):</strong> Somente <strong>após</strong> a confirmação de que o banco de dados foi atualizado, o <strong>Desenvolvedor</strong> backend atualiza as entidades do TypeORM no código para refletir o novo schema.
  </li>
</ol>
<p>
  Esta abordagem garante que o banco de dados permaneça saudável, consistente e otimizado, evoluindo de forma alinhada às necessidades do negócio e sob a supervisão de especialistas.
</p>
