<div align="center">
      <a href="https://www.mysql.com/" target="blank"><img
            src="https://www.mysql.com/common/logos/logo-mysql-170x115.png" width="150" alt="MySQL Logo"></a>
      <h1 align="center">Documentação do Banco de Dados - Inspeção Digital 8/18</h1>
      <p align="center">
            <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"
            alt="MySQL 8.0">
            <img src="https://img.shields.io/badge/Schema-3ª_Forma_Normal-28A745?style=for-the-badge"
            alt="Schema em 3FN">
            <img src="https://img.shields.io/badge/Status-Estável-blue?style=for-the-badge" alt="Status Estável">
          </p>
</div>

<h2 id="visao-geral">📜 Visão Geral</h2>
<p>
    Este repositório contém toda a documentação, scripts e artefatos relacionados à camada de persistência da Aplicação
    de Inspeção Digital. O objetivo é servir como a <strong>fonte única da verdade</strong> para a estrutura de dados
    que suporta o sistema.
</p>

<h2 id="sumario">📖 Sumário</h2>
<ul>
    <li><a href="#guia-rapido">Guia Rápido (Como Começar)</a></li>
    <li><a href="#guia-de-contribuicao">Guia de Contribuição (Específico do BD)</a>
        <ul>
            <li><a href="#desenvolvimento-paralelo">O BD como Contrato para o Desenvolvimento Paralelo</a></li>
            <li><a href="#governanca-schema">Governança e Evolução do Schema</a></li>
            <li><a href="#scripts-uteis">Scripts Úteis para Desenvolvimento</a></li>
        </ul>
    </li>
    <li><a href="#arquitetura-dados">Arquitetura e Dicionário de Dados</a>
        <ul>
            <li><a href="#mer">Modelo de Entidade-Relacionamento (MER)</a></li>
            <li><a href="#dicionario-de-dados-completo">Dicionário de Dados Completo</a></li>
            <li><a href="#decisoes-design">Decisões de Design</a></li>
        </ul>
    </li>
    <li><a href="#detalhes-implementacao">Detalhes de Implementação</a></li>
</ul>
<hr>

<h2 id="guia-rapido">🚀 Guia Rápido (Como Começar)</h2>
<p>Esta seção é para você que precisa apenas "subir" o banco de dados para trabalhar em outra frente do projeto.</p>

<h4>Para Desenvolvedores (Backend/Frontend)</h4>
<p>
    Para iniciar o banco de dados como parte do ambiente de desenvolvimento completo, execute o seguinte comando a
    partir da <strong>pasta raiz do projeto principal</strong>:
</p>
<pre><code># Usando Docker
docker compose up -d db

# Usando Podman
podman-compose up -d db</code></pre>
<p>O banco de dados estará acessível em <code>localhost:3306</code> e pronto para ser consumido pela API.</p>

<h4>Para DBAs e Desenvolvimento Focado no Banco</h4>
<p>
    Se você precisa trabalhar exclusivamente no schema, execute os comandos a partir <strong>desta pasta</strong>
    (<code>/checklist-8-18-bd</code>):
</p>
<pre><code>podman-compose up --build -d</code></pre>

<hr>

<h2 id="guia-de-contribuicao">🤝 Guia de Contribuição (Específico do BD)</h2>
<p>
    Para as diretrizes gerais do projeto (branching, PRs, etc.), consulte o <a href="../CONTRIBUTING.md">Guia de
        Contribuição Principal</a>. Abaixo estão as nuances específicas para trabalhar com o banco de dados.
</p>

<h3 id="desenvolvimento-paralelo">O Banco de Dados como Contrato para o Desenvolvimento Paralelo</h3>
<p>
    Nossa filosofia de trabalho visa minimizar bloqueios entre as equipes. O schema do banco de dados, definido e
    documentado neste repositório, funciona como um <strong>contrato imutável</strong> para o time de Backend.
</p>
<blockquote>
    <p>
        <strong>Como isso funciona na prática?</strong><br>
        Uma vez que uma nova estrutura de tabela ou coluna é definida, documentada no Dicionário de Dados e aprovada, o
        <strong>time de Backend não precisa esperar</strong> a migração ser aplicada em todos os ambientes. Eles podem
        imediatamente começar a desenvolver suas lógicas de negócio, mockando a camada de acesso a dados (repositórios)
        com base neste contrato.
    </p>
</blockquote>

<h3 id="governanca-schema">Governança e Evolução do Schema ("Database First")</h3>
<p>
    A evolução do schema segue uma abordagem estrita e segura de <strong>"Database First"</strong>. A autoridade para
    modificar o schema pertence ao DBA, com validação do Product Owner (PO). A aplicação backend <strong>nunca</strong>
    deve alterar o banco (<code>DB_SYNCHRONIZE='false'</code>).
</p>
<p>O fluxo para qualquer alteração é:</p>
<ol>
    <li><strong>Proposta de Mudança:</strong> O Desenvolvedor ou PO formaliza a necessidade.</li>
    <li><strong>Análise e Aprovação:</strong> O PO valida o valor de negócio e o DBA analisa o impacto técnico.</li>
    <li><strong>Desenvolvimento da Migração:</strong> O DBA cria um script SQL de migração versionado (ex:
        <code>V2__Add_inspections_priority_column.sql</code>).
    </li>
    <li><strong>Aplicação Controlada:</strong> O DBA aplica o script nos ambientes.</li>
    <li><strong>Sincronização da Aplicação:</strong> Somente após a migração, o Desenvolvedor backend atualiza as
        entidades do TypeORM no código.</li>
</ol>

<h3 id="scripts-uteis">Scripts Úteis para Desenvolvimento e Validação</h3>
<ul>
    <li><strong><code>casosDeUso.sql</code>:</strong> Um script poderoso que simula os fluxos da aplicação diretamente
        no banco. Excelente para testar a integridade do modelo e otimizações.</li>
    <li><strong>Script de Limpeza:</strong> Antes de rodar o <code>casosDeUso.sql</code>, use o script de reset abaixo
        para limpar os dados transacionais e evitar conflitos.</li>
</ul>
<pre><code>-- Desativa a verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 0;
-- Limpa as tabelas transacionais
TRUNCATE TABLE `item_evidences`, `inspection_checklist_items`, `inspections`;
-- Reativa a verificação
SET FOREIGN_KEY_CHECKS = 1;</code></pre>

<hr>

<h2 id="arquitetura-dados">🏛️ Arquitetura e Dicionário de Dados</h2>

<h3 id="mer">Modelo de Entidade-Relacionamento (MER)</h3>
<p>O diagrama a seguir ilustra a estrutura das tabelas e seus relacionamentos.</p>
<blockquote>
    <strong>Nota:</strong> O código abaixo é Mermaid. Se não for renderizado corretamente no seu visualizador, você pode
    usar um editor online como o <a href="https://mermaid.live/" target="_blank">Mermaid Live Editor</a> para colar o
    código e ver o diagrama.
</blockquote>

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
        <tr>
            <td><code>lookup_statuses</code></td>
            <td>Status possíveis para uma inspeção geral (ex: EM_INSPECAO, APROVADO).</td>
        </tr>
        <tr>
            <td><code>lookup_modalities</code></td>
            <td>Modalidades de transporte disponíveis (ex: RODOVIARIO, MARITIMO).</td>
        </tr>
        <tr>
            <td><code>lookup_operation_types</code></td>
            <td>Tipos de operação aduaneira, geralmente indicando nível de risco (ex: VERDE, VERMELHA).</td>
        </tr>
        <tr>
            <td><code>lookup_unit_types</code></td>
            <td>Tipos de unidade de carga (ex: CONTAINER, BAU).</td>
        </tr>
        <tr>
            <td><code>lookup_container_types</code></td>
            <td>Tipos específicos de contêineres (ex: DRY_20, REEFER_40).</td>
        </tr>
        <tr>
            <td><code>lookup_checklist_item_statuses</code></td>
            <td>Status para cada item da inspeção (ex: CONFORME, NAO_CONFORME).</td>
        </tr>
        <tr>
            <td><code>lookup_seal_verification_statuses</code></td>
            <td>Status para a verificação de lacres de saída (ex: OK, NAO_OK).</td>
        </tr>
    </tbody>
</table>

<hr>

<h3>Tabelas Principais</h3>

<h4><strong><code>master_inspection_points</code></strong></h4>
<p>Tabela mestre com a definição dos 18 pontos de inspeção padrão. Esta tabela é imutável e serve como base para todos
    os checklists.</p>
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
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>Identificador único do ponto de inspeção.</td>
            <td><code>5</code></td>
        </tr>
        <tr>
            <td><code>point_number</code></td>
            <td>INT</td>
            <td>UNIQUE</td>
            <td>Não</td>
            <td>Número oficial do ponto (1 a 18).</td>
            <td><code>5</code></td>
        </tr>
        <tr>
            <td><code>name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome resumido do ponto.</td>
            <td><code>"PISO DO CAMINHÃO"</code></td>
        </tr>
        <tr>
            <td><code>description</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Descrição detalhada do procedimento de inspeção.</td>
            <td><code>"Levantar o carpete..."</code></td>
        </tr>
        <tr>
            <td><code>category</code></td>
            <td>VARCHAR(50)</td>
            <td></td>
            <td>Não</td>
            <td>Agrupador do ponto: 'VEICULO' ou 'CONTEINER'.</td>
            <td><code>"VEICULO"</code></td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspections</code></strong></h4>
<p>Tabela central que armazena cada registo de inspeção, contendo todos os dados do cabeçalho do formulário.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único da inspeção (auto-incremento).</td>
            <td><code>1001</code></td>
        </tr>
        <tr>
            <td><code>inspector_name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome do inspetor responsável.</td>
            <td><code>"Carlos Souza"</code></td>
        </tr>
        <tr>
            <td><code>status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do status geral (ref. <code>lookup_statuses</code>).</td>
            <td><code>2</code></td>
        </tr>
        <tr>
            <td><code>entry_registration</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Número do registo de entrada.</td>
            <td><code>"RE-2025-099"</code></td>
        </tr>
        <tr>
            <td><code>vehicle_plates</code></td>
            <td>VARCHAR(20)</td>
            <td></td>
            <td>Sim</td>
            <td>Placa do veículo inspecionado.</td>
            <td><code>"BRA2E19"</code></td>
        </tr>
        <tr>
            <td><code>transport_document</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Nº do documento de transporte (CTe, etc.).</td>
            <td><code>"CTE123456"</code></td>
        </tr>
        <tr>
            <td><code>modality_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID da modalidade (ref. <code>lookup_modalities</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>operation_type_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do tipo de operação (ref. <code>lookup_operation_types</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>unit_type_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do tipo de unidade (ref. <code>lookup_unit_types</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>container_type_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>ID do tipo de contêiner (ref. <code>lookup_container_types</code>).</td>
            <td><code>2</code></td>
        </tr>
        <tr>
            <td><code>verified_length</code></td>
            <td>DECIMAL(10,2)</td>
            <td></td>
            <td>Sim</td>
            <td>Comprimento verificado em metros.</td>
            <td><code>12.02</code></td>
        </tr>
        <tr>
            <td><code>verified_width</code></td>
            <td>DECIMAL(10,2)</td>
            <td></td>
            <td>Sim</td>
            <td>Largura verificada em metros.</td>
            <td><code>2.35</code></td>
        </tr>
        <tr>
            <td><code>verified_height</code></td>
            <td>DECIMAL(10,2)</td>
            <td></td>
            <td>Sim</td>
            <td>Altura verificada em metros.</td>
            <td><code>2.69</code></td>
        </tr>
        <tr>
            <td><code>start_datetime</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Não</td>
            <td>Data e hora de início da inspeção.</td>
            <td><code>"2025-08-11 14:30:00"</code></td>
        </tr>
        <tr>
            <td><code>end_datetime</code></td>
            <td>DATETIME</td>
            <td></td>
            <td>Sim</td>
            <td>Data e hora de finalização da inspeção.</td>
            <td><code>"2025-08-11 15:15:00"</code></td>
        </tr>
        <tr>
            <td><code>driver_name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome do motorista.</td>
            <td><code>"José da Silva"</code></td>
        </tr>
        <tr>
            <td><code>driver_signature_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Caminho para o ficheiro da assinatura do motorista.</td>
            <td><code>"/uploads/signatures/driver_1001.png"</code></td>
        </tr>
        <tr>
            <td><code>inspector_signature_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Caminho para o ficheiro da assinatura do inspetor.</td>
            <td><code>"/uploads/signatures/inspector_1001.png"</code></td>
        </tr>
        <tr>
            <td><code>seal_uaga_post_inspection</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Nº do lacre UAGA pós-inspeção.</td>
            <td><code>"UAGA1234"</code></td>
        </tr>
        <tr>
            <td><code>seal_uaga_post_loading</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Nº do lacre UAGA pós-carregamento.</td>
            <td><code>"UAGA5678"</code></td>
        </tr>
        <tr>
            <td><code>seal_shipper</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Lacre do armador (shipper).</td>
            <td><code>"SHIPPER321"</code></td>
        </tr>
        <tr>
            <td><code>seal_rfb</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Sim</td>
            <td>Lacre da Receita Federal (RFB).</td>
            <td><code>"RFB987"</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_rfb_status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Status do lacre RFB (ref. <code>lookup_seal_verification_statuses</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_shipper_status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Status do lacre Shipper (ref. <code>lookup_seal_verification_statuses</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_tape_status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Sim</td>
            <td>Status da fita lacre (ref. <code>lookup_seal_verification_statuses</code>).</td>
            <td><code>1</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_responsible_name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Sim</td>
            <td>Nome do responsável pela verificação dos lacres.</td>
            <td><code>"Ana Souza"</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_signature_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Caminho para a assinatura do responsável.</td>
            <td><code>"/uploads/signatures/verifier_1001.png"</code></td>
        </tr>
        <tr>
            <td><code>seal_verification_date</code></td>
            <td>DATE</td>
            <td></td>
            <td>Sim</td>
            <td>Data da verificação dos lacres de saída.</td>
            <td><code>"2025-08-11"</code></td>
        </tr>
        <tr>
            <td><code>observations</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Observações gerais da inspeção.</td>
            <td><code>"Veículo em bom estado."</code></td>
        </tr>
        <tr>
            <td><code>action_taken</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Providências tomadas em caso de inconformidade.</td>
            <td><code>"N/A"</code></td>
        </tr>
        <tr>
            <td><code>generated_pdf_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Sim</td>
            <td>Caminho para o relatório PDF gerado.</td>
            <td><code>"/reports/inspecao_1001.pdf"</code></td>
        </tr>
        <tr>
            <td><code>created_at</code></td>
            <td>TIMESTAMP</td>
            <td></td>
            <td>Não</td>
            <td>Timestamp da criação do registo.</td>
            <td><code>"2025-08-11 14:30:00"</code></td>
        </tr>
        <tr>
            <td><code>updated_at</code></td>
            <td>TIMESTAMP</td>
            <td></td>
            <td>Não</td>
            <td>Timestamp da última atualização do registo.</td>
            <td><code>"2025-08-11 15:15:00"</code></td>
        </tr>
    </tbody>
</table>

<h4><strong><code>inspection_checklist_items</code></strong></h4>
<p>Tabela associativa que regista o estado de cada um dos 18 pontos para uma inspeção específica.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único do item de checklist.</td>
            <td><code>5001</code></td>
        </tr>
        <tr>
            <td><code>inspection_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID da inspeção relacionada (ref. <code>inspections</code>).</td>
            <td><code>1001</code></td>
        </tr>
        <tr>
            <td><code>master_point_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do ponto de inspeção (ref. <code>master_inspection_points</code>).</td>
            <td><code>11</code></td>
        </tr>
        <tr>
            <td><code>status_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do status do item (ref. <code>lookup_checklist_item_statuses</code>).</td>
            <td><code>2</code></td>
        </tr>
        <tr>
            <td><code>observations</code></td>
            <td>TEXT</td>
            <td></td>
            <td>Sim</td>
            <td>Observações específicas para este ponto.</td>
            <td><code>"Pneu dianteiro direito com desgaste."</code></td>
        </tr>
        <tr>
            <td><code>created_at</code></td>
            <td>TIMESTAMP</td>
            <td></td>
            <td>Não</td>
            <td>Timestamp da criação do registo.</td>
            <td><code>"2025-08-11 14:45:10"</code></td>
        </tr>
        <tr>
            <td><code>updated_at</code></td>
            <td>TIMESTAMP</td>
            <td></td>
            <td>Não</td>
            <td>Timestamp da última atualização do registo.</td>
            <td><code>"2025-08-11 14:45:10"</code></td>
        </tr>
    </tbody>
</table>

<h4><strong><code>item_evidences</code></strong></h4>
<p>Armazena os metadados das evidências (imagens) anexadas a um item de checklist.</p>
<table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
        <tr>
            <th align="left">Nome da Coluna</th>
            <th align="left">Tipo de Dado</th>
            <th align="left">Chave</th>
            <th align="left">Nulo?</th>
            <th align="left">Descrição</th>
            <th align="left">Exemplo</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>id</code></td>
            <td>INT</td>
            <td>PK</td>
            <td>Não</td>
            <td>ID único da evidência.</td>
            <td><code>9001</code></td>
        </tr>
        <tr>
            <td><code>item_id</code></td>
            <td>INT</td>
            <td>FK</td>
            <td>Não</td>
            <td>ID do item de checklist relacionado (ref. <code>inspection_checklist_items</code>).</td>
            <td><code>5001</code></td>
        </tr>
        <tr>
            <td><code>file_path</code></td>
            <td>VARCHAR(512)</td>
            <td></td>
            <td>Não</td>
            <td>Caminho relativo para o ficheiro no sistema de armazenamento.</td>
            <td><code>"1001/11_1660234210.png"</code></td>
        </tr>
        <tr>
            <td><code>file_name</code></td>
            <td>VARCHAR(255)</td>
            <td></td>
            <td>Não</td>
            <td>Nome original do ficheiro enviado.</td>
            <td><code>"foto_pneu.png"</code></td>
        </tr>
        <tr>
            <td><code>file_size</code></td>
            <td>INT</td>
            <td></td>
            <td>Não</td>
            <td>Tamanho do ficheiro em bytes.</td>
            <td><code>312456</code></td>
        </tr>
        <tr>
            <td><code>mime_type</code></td>
            <td>VARCHAR(100)</td>
            <td></td>
            <td>Não</td>
            <td>Tipo MIME do ficheiro (ex: image/png).</td>
            <td><code>"image/png"</code></td>
        </tr>
        <tr>
            <td><code>created_at</code></td>
            <td>TIMESTAMP</td>
            <td></td>
            <td>Não</td>
            <td>Timestamp do upload do ficheiro.</td>
            <td><code>"2025-08-11 14:46:05"</code></td>
        </tr>
    </tbody>
</table>

<h3 id="decisoes-design">Decisões de Design (Normalização e Indexação)</h3>
<ul>
    <li><strong>Normalização (3FN):</strong> O schema está na Terceira Forma Normal para eliminar redundância e garantir
        a consistência dos dados, principalmente através do uso intensivo de <strong>Tabelas de Lookup</strong>
        (<code>lookup_*</code>).</li>
    <li><strong>Integridade Referencial:</strong> Todas as relações são reforçadas com chaves estrangeiras
        (<code>FK</code>), utilizando <code>ON DELETE CASCADE</code> onde apropriado para manter a consistência.</li>
    <li><strong>Indexação:</strong> Índices foram criados em todas as colunas de chave estrangeira para acelerar
        consultas e, crucialmente, para evitar <strong>table locks</strong> durante transações.</li>
</ul>

<hr>

<h2 id="detalhes-implementacao">⚙️ Detalhes de Implementação</h2>
<p>
    Esta seção contém informações sobre os artefatos técnicos e o racional por trás das escolhas de tecnologia.
</p>
<h3>Script de Inicialização (init.sql)</h3>
<p>
    O arquivo <code>init.sql</code> contém os comandos DDL (<code>CREATE TABLE</code>) e DML (<code>INSERT</code>) para
    criar o schema e popular as tabelas mestras. Ele é executado <strong>automaticamente</strong> na primeira
    inicialização do contêiner do banco.
</p>

<h3>Tecnologia e Racional</h3>
<p>
    O <strong>MySQL 8.0</strong> foi escolhido por ser uma tecnologia robusta e já existente na infraestrutura da UAGA.
    A aplicação utiliza o ORM <strong>TypeORM</strong>, o que a desacopla da tecnologia específica do banco, permitindo
    futuras migrações com impacto mínimo.
</p>