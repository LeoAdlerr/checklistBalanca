<div align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="150" alt="Nest Logo" /></a>
  <h1 align="center">Documentação do Backend - Inspeção Digital 8/18</h1>
  <p align="center">
    <img src="https://img.shields.io/badge/NestJS-10.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tests-100%25-brightgreen?style=for-the-badge&logo=jest" alt="Testes">
  </p>
</div>

<p>
  Bem-vindo à documentação técnica da API do sistema de Inspeção Digital 8/18. Este serviço, construído com <strong>NestJS</strong>, é o coração da aplicação, responsável por toda a lógica de negócio, processamento de dados e interações com a infraestrutura.
</p>

<hr>

<h2>📜 Sumário</h2>

<ul>
  <li><a href="#filosofia-e-decisoes">Filosofia e Decisões de Arquitetura</a></li>
  <li><a href="#arquitetura">Arquitetura Detalhada: Clean Architecture & DDD</a></li>
  <li><a href="#stack-tecnologico">Stack Tecnológico</a></li>
  <li><a href="#ambiente-de-desenvolvimento">Ambiente de Desenvolvimento</a></li>
  <li><a href="#testes-automatizados">Testes Automatizados</a></li>
  <li><a href="#estrutura-de-pastas">Estrutura de Pastas</a></li>
  <li><a href="#referencia-api">Referência da API (Swagger)</a></li>
  <li><a href="#deploy-em-producao-iis">Deploy em Produção (IIS)</a></li>
  <li><a href="#guia-de-contribuicao">Guia de Contribuição</a></li>
  <li><a href="#diagramas-de-classe">Diagramas de Classe e Sequência</a></li>
</ul>

<hr>

<h2 id="filosofia-e-decisoes">💡 Filosofia e Decisões de Arquitetura</h2>
<p>
  A escolha das tecnologias e da arquitetura para o backend não foi acidental, mas sim o resultado de um processo de decisão estratégico focado na qualidade, sustentabilidade e no contexto da equipe da Universal Armazéns.
</p>
<ul>
  <li>
    <strong>O "Pivot" Estratégico: De Java/Spring para NestJS</strong><br>
    Como PO e Desenvolvedor do projeto, com forte experiência tanto em Java/Spring quanto em NestJS, o desenvolvimento foi iniciado com Java. No entanto, uma análise estratégica revelou que a sustentabilidade do projeto a longo prazo seria maior com uma tecnologia mais alinhada ao conhecimento existente na equipe interna, que já possuía experiência com Node.js. A decisão de migrar para <strong>NestJS</strong> foi tomada para <strong>reduzir a curva de aprendizado futura</strong> e garantir que a aplicação pudesse ser facilmente mantida e evoluída pela equipe da Universal Armazéns.
  </li>
  <li>
    <strong>Arquitetura Acima da Ferramenta</strong><br>
    A prioridade sempre foi construir uma aplicação robusta e de fácil manutenção. Independentemente da linguagem, a aplicação da <strong>Clean Architecture</strong> e do <strong>DDD</strong> era um requisito fundamental. O NestJS, com o seu forte suporte a TypeScript, Orientação a Objetos e um sistema de Injeção de Dependência nativo, provou ser o veículo perfeito para implementar estes padrões de design complexos, permitindo uma separação clara entre as camadas de API, Domínio e Infraestrutura.
  </li>
  <li>
    <strong>Um Ecossistema de Testes Unificado e Comprovado</strong><br>
    A escolha do <strong>Jest</strong> como framework de testes para <strong>ambos os testes unitários e E2E</strong> foi baseada em experiências positivas em projetos anteriores. Esta decisão permitiu a criação de um fluxo de trabalho de testes rápido e eficiente, resultando numa suíte de testes completa que valida cada camada da aplicação, desde os Use Cases isolados até os fluxos de API de ponta a ponta.
  </li>
</ul>

<hr>

<h2 id="arquitetura">🏛️ Arquitetura Detalhada: Clean Architecture & DDD</h2>
<p>
  A arquitetura desta API é o seu maior diferencial. Ela foi projetada seguindo rigorosamente os princípios da <strong>Clean Architecture (Arquitetura Limpa)</strong> e <strong>Domain-Driven Design (DDD)</strong>, com o objetivo de criar um sistema desacoplado, altamente testável e manutenível.
</p>
<h3>A Regra da Dependência</h3>
<p>
  O diagrama abaixo ilustra a Regra da Dependência: as setas apontam sempre para dentro. Camadas externas conhecem as internas, mas as internas (especialmente o Domínio) são puras e independentes de detalhes de implementação.
</p>
<div align="center">

  ```mermaid
graph TD
    subgraph API["Camada de API (Apresentação)"]
        A["Controllers\n DTOs"]
    end

    subgraph Dominio["Camada de Domínio (Regras de Negócio)"]
        B["Use Cases\n(Lógica da Aplicação)"]
        C["Models / Entities\n(Regras de Negócio Puras)"]
        D["Interfaces de Repositório\n(Portas)"]
    end

    subgraph Infra["Camada de Infraestrutura (Detalhes)"]
        E["Implementação do Repositório\n(TypeORM Adapter)"]
        F["Implementação do File System\n(Adapter Local)"]
        G["Banco de Dados\n(MySQL)"]
        H["Armazenamento Físico\n(/uploads)"]
    end

    A -- "Depende de / Injeta" --> B
    B -- "Usa" --> C
    B -- "Depende de (Porta)" --> D
    D -- "<<interface>>" --> E
    E -- "Usa" --> G
    D -- "<<interface>>" --> F
    F -- "Usa" --> H

    style A fill:#fce4ec,stroke:#ad1457,stroke-width:2px
    style B fill:#fff,stroke:#333,stroke-width:2px
    style C fill:#fffde7,stroke:#f57f17,stroke-width:2px
    style D fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    style E fill:#ede7f6,stroke:#4527a0,stroke-width:2px
    style F fill:#ede7f6,stroke:#4527a0,stroke-width:2px
```

</div>
<h3>Os Pilares da Arquitetura</h3>
<ul>
<li><strong>Camada de Domínio (<code>/domain</code>):</strong> O coração da aplicação. Contém os <strong>Models</strong> (regras de negócio puras), <strong>Use Cases</strong> (orquestradores da lógica) e as <strong>Interfaces (Portas)</strong> que definem os contratos com o mundo exterior (ex: <code>IInspectionRepository</code>).</li>
<li><strong>Camada de API (<code>/api</code>):</strong> A porta de entrada do sistema. Os <strong>Controllers</strong> recebem as requisições HTTP, validam os <strong>DTOs</strong> e invocam o Use Case correspondente.</li>
<li><strong>Camada de Infraestrutura (<code>/infra</code>):</strong> Onde os "detalhes" são implementados. Os <strong>Adaptadores</strong> (ex: <code>TypeOrmInspectionRepository</code>) implementam as interfaces do domínio. Se um dia migrarmos de MySQL para PostgreSQL, apenas esta camada é alterada.</li>
<li><strong>Injeção de Dependência (DI):</strong> O NestJS é usado para "conectar" estas camadas, respeitando o princípio da Inversão de Dependência (o "D" do SOLID).</li>
</ul>

<hr>

<h2 id="stack-tecnologico">🛠️ Stack Tecnológico</h2>
<table border="1" style="border-collapse: collapse; width:100%;">
<thead bgcolor="#f2f2f2">
<tr>
<th align="left">Categoria</th>
<th align="left">Tecnologia/Ferramenta</th>
<th align="left">Propósito</th>
</tr>
</thead>
<tbody>
<tr><td>Framework Principal</td><td><strong>NestJS 10.x</strong></td><td>Estrutura da aplicação, DI, modularidade.</td></tr>
<tr><td>Linguagem</td><td><strong>TypeScript 5.x</strong></td><td>Tipagem estática e funcionalidades modernas de JS.</td></tr>
<tr><td>Acesso a Dados</td><td><strong>TypeORM</strong></td><td>ORM para interação com o banco de dados.</td></tr>
<tr><td>Banco de Dados</td><td><strong>MySQL 8.0</strong></td><td>Persistência dos dados relacionais.</td></tr>
<tr><td>Testes</td><td><strong>Jest & Supertest</strong></td><td>Testes unitários, de integração e E2E.</td></tr>
<tr><td>Serviços Auxiliares</td><td><strong>Puppeteer / Multer</strong></td><td>Geração de PDF e upload de ficheiros.</td></tr>
<tr><td>Containerização</td><td><strong>Docker / Podman</strong></td><td>Ambiente de desenvolvimento e CI.</td></tr>
</tbody>
</table>

<hr>

<h2 id="ambiente-de-desenvolvimento">🚀 Ambiente de Desenvolvimento</h2>
<p>
  Esta seção fornece um guia completo para configurar e executar o ambiente de desenvolvimento do backend. A abordagem recomendada é utilizar o ambiente containerizado, que garante consistência e simplicidade.
</p>

<h3>Opção 1: Ambiente Containerizado via Docker/Podman (Recomendado)</h3>
<p>
  Esta é a forma mais rápida e segura de rodar o backend, pois o <code>docker-compose.yml</code> deste diretório orquestra não apenas a API, mas também um banco de dados dedicado e executa o pipeline de testes automaticamente.
</p>
<h4>Pré-requisitos</h4>
<ul>
  <li>Docker ou Podman (com podman-compose) instalado.</li>
</ul>
<h4>Instruções</h4>
<ol>
  <li>Navegue até esta pasta: <code>cd checklist-8-18-back</code></li>
  <li>
    Execute o comando para construir e iniciar os serviços:
    <pre><code># Para Podman
podman-compose up --build

# Para Docker

docker compose build</code></pre>
  </li>
</ol>
<p>
  Este comando irá:
  <ol>
    <li>Construir a imagem do contêiner.</li>
    <li>Iniciar um contêiner para o banco de dados MySQL.</li>
    <li>Aguardar o banco de dados ficar pronto.</li>
    <li>Iniciar o contêiner do backend, que por sua vez irá <strong>executar todos os testes unitários e E2E</strong>.</li>
    <li>Se todos os testes passarem, iniciar a aplicação em modo de desenvolvimento.</li>
  </ol>
</p>

<hr>

<h3>Opção 2: Ambiente Local (Executando na sua Máquina)</h3>
<p>
  Para desenvolvedores que preferem rodar o Node.js diretamente na máquina host.
</p>
<h4>Pré-requisitos</h4>
<ul>
  <li>
    <strong>Node.js:</strong> Versão 20 ou superior. Recomenda-se o uso de um gestor de versões como o <a href="https://github.com/nvm-sh/nvm">nvm</a> para instalar e gerir as versões do Node.js.
  </li>
  <li>
    <strong>Yarn:</strong> Gestor de pacotes do projeto. (<a href="https://yarnpkg.com/getting-started/install">Instalação</a>)
  </li>
  <li>
    <strong>Instância MySQL:</strong> Um servidor de banco de dados MySQL deve estar a correr e acessível a partir da sua máquina. Pode usar o contêiner do passo anterior (<code>podman-compose up -d db</code>) ou uma instalação local.
  </li>
</ul>

<h4>Instruções Passo a Passo</h4>
<ol>
  <li>
    <strong>Instale as Dependências:</strong>
    <pre><code>yarn install</code></pre>
  </li>
  <li>
    <strong>Configure as Variáveis de Ambiente:</strong>
    <p>Copie o ficheiro <code>.env.example</code> para <code>.env</code> e preencha com as credenciais do seu banco de dados local (ex: <code>DB_HOST=localhost</code>).</p>
    <pre><code>cp .env.example .env</code></pre>
  </li>
  <li>
    <strong>Execute o Pipeline de Qualidade (Manual):</strong><br>
    Para simular o nosso CI e garantir a qualidade do seu código, execute os testes na mesma ordem que o ambiente containerizado faria.
    <p>Primeiro, os testes unitários:</p>
    <pre><code>yarn test</code></pre>
    <p>Depois, os testes End-to-End (garanta que o seu <code>.env</code> aponta para um banco de dados de teste):</p>
    <pre><code>yarn test:e2e</code></pre>
  </li>
  <li>
    <strong>Inicie o Servidor de Desenvolvimento:</strong>
    <p>Se todos os testes passaram, inicie o servidor em modo de desenvolvimento com hot-reload.</p>
    <pre><code>yarn start:dev</code></pre>
  </li>
</ol>

<hr>

<h3>Executando em Modo de Produção</h3>
<p>
  Para executar a aplicação num ambiente de produção, o processo é diferente. Não usamos o modo de desenvolvimento (`start:dev`), mas sim o código transpilado e otimizado.
</p>
<ol>
  <li>
    <strong>Gere o Build de Produção:</strong><br>
    Este comando transpila o código TypeScript para JavaScript puro numa pasta <code>/dist</code>.
    <pre><code>yarn build</code></pre>
  </li>
  <li>
    <strong>Inicie a Aplicação em Modo de Produção:</strong><br>
    Este comando executa o ficheiro <code>main.js</code> a partir da pasta <code>/dist</code> usando o Node.js.
    <pre><code>yarn start:prod</code></pre>
  </li>
</ol>
<blockquote>
  <p>
    <strong>Nota Importante:</strong> Para um ambiente de produção real, é altamente recomendável utilizar um gestor de processos como o <a href="https://pm2.keymetrics.io/">PM2</a>. Ele garante que a sua aplicação reinicie automaticamente em caso de falhas, além de oferecer balanceamento de carga, monitorização e gestão de logs. <br>Exemplo com PM2: <code>pm2 start dist/main.js --name "checklist-api"</code>
  </p>
</blockquote>

<h2 id="estrutura-de-pastas">📁 Estrutura de Pastas (<code>src/</code> e <code>test/</code>)</h2>
<p>
  A estrutura de pastas do projeto foi desenhada para ser intuitiva e escalável, refletindo diretamente a implementação da Clean Architecture. A pasta <code>test/</code> espelha a estrutura da <code>src/</code>, facilitando a localização dos testes para cada componente.
</p>
<pre><code>
├── src/
│   ├── api/
│   ├── domain/
│   ├── infra/
│   └── modules/
└── test/
    ├── unit/
    │   ├── domain/
    │   │   └── use-cases/
    │   ├── api/
    │   └── infra/
    └── e2e/
</code></pre>
<ul>
  <li>
    <code><strong>/src</strong></code>: Contém todo o código-fonte da aplicação.
    <ul>
      <li><code>/api</code>: A <strong>Camada de Apresentação</strong> (Controllers, DTOs, Pipes).</li>
      <li><code>/domain</code>: O <strong>Coração do Negócio</strong> (Models, Use Cases, Ports, Repositories).</li>
      <li><code>/infra</code>: Os <strong>Detalhes de Implementação</strong> (TypeORM, File System, PDF).</li>
      <li><code>/modules</code>: Os <strong>Módulos do NestJS</strong> que organizam a injeção de dependência.</li>
    </ul>
  </li>
  <li>
    <code><strong>/test</strong></code>: Contém todos os testes automatizados da aplicação.
    <ul>
      <li>
        <code>/unit</code>: Testes <strong>Unitários e de Integração</strong>.
        <ul>
          <li>A sua estrutura espelha a de <code>src/</code>. Por exemplo, os testes para os Use Cases em <code>src/domain/use-cases</code> encontram-se em <code>test/unit/domain/use-cases</code>.</li>
          <li>Isto inclui testes isolados para <strong>Use Cases</strong> (regras de negócio), <strong>Controllers</strong> (camada HTTP) e <strong>Services</strong> da infraestrutura (adaptadores).</li>
        </ul>
      </li>
      <li>
        <code>/e2e</code>: Testes <strong>End-to-End</strong>.
        <ul>
          <li>Estes testes iniciam uma instância completa da aplicação e interagem com a API e o banco de dados de teste para validar os fluxos de usuário de ponta a ponta.</li>
        </ul>
      </li>
      <li><code>jest-e2e.json</code>: Ficheiro de configuração específico para a execução dos testes E2E.</li>
    </ul>
  </li>
</ul>

<hr>

<h2 id="referencia-api">📡 Referência da API (Swagger)</h2>
<p>
Após iniciar a aplicação, a documentação completa e interativa da API, gerada com o Swagger, está disponível em:<br>
<a href="http://localhost:8888/api"><strong>http://localhost:8888/api</strong></a>
</p>
<details>
  <summary><strong>Clique para expandir a lista de Endpoints da API</strong></summary>

  <p>A seguir, a lista dos principais endpoints da API. Uma documentação interativa completa está disponível via <strong>Swagger</strong> em <code>/api</code> após a aplicação ser iniciada.</p>

  <table border="1" style="border-collapse: collapse; width:100%;">
    <thead>
      <tr>
        <th align="left">Método</th>
        <th align="left">Endpoint</th>
        <th align="left">Descrição</th>
      </tr>
    </thead>
    <tbody>
      <tr bgcolor="#f8f9fa"><td colspan="3" align="center"><strong>Lookups (Dados de Suporte)</strong></td></tr>
      <tr><td><code>GET</code></td><td><code>/lookups/:type</code></td><td>Busca uma lista de valores de suporte (ex: status, modalidades).</td></tr>
      <tr bgcolor="#f8f9fa"><td colspan="3" align="center"><strong>Gestão de Inspeções</strong></td></tr>
      <tr><td><code>POST</code></td><td><code>/inspections/check-existing</code></td><td>Verifica se uma inspeção similar já existe.</td></tr>
      <tr><td><code>POST</code></td><td><code>/inspections</code></td><td>Cria um novo registro de inspeção.</td></tr>
      <tr><td><code>GET</code></td><td><code>/inspections</code></td><td>Lista todas as inspeções.</td></tr>
      <tr><td><code>GET</code></td><td><code>/inspections/:id</code></td><td>Retorna os detalhes completos de uma inspeção.</td></tr>
      <tr><td><code>PATCH</code></td><td><code>/inspections/:id</code></td><td>Atualiza os dados de cabeçalho de uma inspeção.</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/inspections/:id</code></td><td>Apaga uma inspeção (se não finalizada).</td></tr>
      <tr><td><code>PATCH</code></td><td><code>/inspections/:id/finalize</code></td><td>Finaliza uma inspeção, calculando o status final.</td></tr>
      <tr bgcolor="#f8f9fa"><td colspan="3" align="center"><strong>Itens do Checklist e Evidências</strong></td></tr>
      <tr><td><code>PATCH</code></td><td><code>/inspections/:inspectionId/points/:pointNumber</code></td><td>Atualiza um item do checklist.</td></tr>
      <tr><td><code>POST</code></td><td><code>/inspections/:inspectionId/points/:pointNumber/evidence</code></td><td>Faz o upload de uma evidência.</td></tr>
      <tr><td><code>DELETE</code></td><td><code>/inspections/:inspectionId/points/:pointNumber/evidence</code></td><td>Apaga uma evidência específica.</td></tr>
      <tr><td><code>GET</code></td><td><code>/inspections/:inspectionId/points/:pointNumber/evidence/:fileName</code></td><td>Baixa um ficheiro de evidência específico.</td></tr>
      <tr bgcolor="#f8f9fa"><td colspan="3" align="center"><strong>Relatórios</strong></td></tr>
      <tr><td><code>GET</code></td><td><code>/inspections/:id/report/html</code></td><td>Obtém a versão HTML do relatório para pré-visualização.</td></tr>
      <tr><td><code>GET</code></td><td><code>/inspections/:id/report/pdf</code></td><td>Gera e baixa o relatório PDF.</td></tr>
    </tbody>
  </table>
</details>

<hr>

<h2 id="deploy-em-producao-iis">🚢 Deploy em Produção (IIS)</h2>
<p>
Esta seção serve como um guia preliminar para a publicação da aplicação Node.js em um ambiente Windows Server com IIS.
</p>
<h3>Pré-requisitos no Servidor</h3>
<ul>
<li><strong>IIS</strong> com o módulo <strong>URL Rewrite</strong> instalado.</li>
<li><strong><a href="https://github.com/tjanczuk/iisnode">iisnode</a></strong>: Módulo para hospedar aplicações Node.js no IIS.</li>
<li><strong>Node.js</strong> (versão LTS) instalado no servidor.</li>
</ul>
<h3>Passos para o Deploy</h3>
<ol>
<li><strong>Build da Aplicação:</strong> Gere a versão de produção com <code>yarn build</code>.</li>
<li><strong>Transferência de Ficheiros:</strong> Copie a pasta <code>/dist</code>, <code>node_modules</code> e <code>package.json</code> para uma pasta no servidor (ex: <code>C:\inetpub\wwwroot\checklist-api</code>).</li>
<li><strong>Configurar o IIS:</strong> Crie um novo Site no IIS apontando para a pasta do projeto. Configure o seu Application Pool para "No Managed Code".</li>
<li><strong>Criar o <code>web.config</code>:</strong> Crie um ficheiro <code>web.config</code> na raiz da pasta no servidor. Este ficheiro instrui o IIS a usar o iisnode para lidar com as requisições.
<pre><code>&lt;configuration&gt;
&lt;system.webServer&gt;
&lt;handlers&gt;
&lt;add name="iisnode" path="main.js" verb="*" modules="iisnode" /&gt;
&lt;/handlers&gt;
&lt;rewrite&gt;
&lt;rules&gt;
&lt;rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true"&gt;
&lt;match url="^main.js/debug[/]?" /&gt;
&lt;/rule&gt;
&lt;rule name="DynamicContent"&gt;
&lt;conditions&gt;
&lt;add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" /&gt;
&lt;/conditions&gt;
&lt;action type="Rewrite" url="main.js" /&gt;
&lt;/rule&gt;
&lt;/rules&gt;
&lt;/rewrite&gt;
&lt;!-- Outras configurações como logging do iisnode podem ser adicionadas aqui --&gt;
&lt;/system.webServer&gt;
&lt;/configuration&gt;
</code></pre>
</li>
<li><strong>Variáveis de Ambiente:</strong> Configure as variáveis de ambiente (conexão com o banco de produção, JWT_SECRET, etc.) no painel de configuração do site no IIS ou diretamente no <code>web.config</code>.</li>
</ol>

<hr>

<h2 id="guia-de-contribuicao">🤝 Guia de Contribuição</h2>
<p>
Este projeto segue um guia de contribuição unificado. Por favor, consulte o <a href="../README.md"><strong>Guia de Contribuição Principal</strong></a> na raiz do projeto antes de iniciar o desenvolvimento.
</p>

<h2 id="diagramas-de-classe">Diagramas de Classe e Sequência</h2>
<p>
  Os diagramas a seguir não são apenas documentação; são a representação visual da nossa filosofia de arquitetura. Eles mostram como os princípios de <strong>Clean Architecture</strong>, <strong>DDD</strong> e <strong>SOLID</strong> foram aplicados na prática para construir um sistema desacoplado, testável e robusto.
</p>
<p>
  Vamos explorar a estrutura em três níveis: o <strong>Modelo de Domínio</strong> (a estrutura dos dados), o <strong>Comportamento Dinâmico</strong> (como os objetos colaboram) e a <strong>Orquestração dos Módulos</strong> (como o NestJS conecta tudo).
</p>

<hr>

<h3>1. O Coração do Domínio: A Entidade <code>InspectionEntity</code></h3>
<p>
  Tudo começa com a nossa entidade principal, a <code>InspectionEntity</code>. Este diagrama de classe mostra a estrutura de dados central da aplicação e as suas relações diretas com as entidades de suporte (Lookups) e as entidades filhas (Checklist Items). É o mapa de dados fundamental do sistema.
</p>

```mermaid
classDiagram
    direction RL

    class LookupEntity {
        <<Abstract>>
        +id: number
        +name: string
    }

    class LookupStatusEntity { <<TypeORM Entity>> }
    class LookupModalityEntity { <<TypeORM Entity>> }
    class LookupOperationTypeEntity { <<TypeORM Entity>> }
    class LookupUnitTypeEntity { <<TypeORM Entity>> }
    class LookupContainerTypeEntity { <<TypeORM Entity>> }
    class LookupSealVerificationStatusEntity { <<TypeORM Entity>> }

    LookupStatusEntity --|> LookupEntity
    LookupModalityEntity --|> LookupEntity
    LookupOperationTypeEntity --|> LookupEntity
    LookupUnitTypeEntity --|> LookupEntity
    LookupContainerTypeEntity --|> LookupEntity
    LookupSealVerificationStatusEntity --|> LookupEntity

    class InspectionChecklistItemEntity {
        <<TypeORM Entity>>
        +id: number
        +observations: string
        +statusId: number
        +masterPointId: number
        + ...
    }

    class InspectionEntity {

        <<TypeORM Entity>>
        +id: number
        +inspectorName: string
        +statusId: number
        +entryRegistration: string
        +vehiclePlates: string
        +transportDocument: string
        +modalityId: number
        +operationTypeId: number
        +unitTypeId: number
        +containerTypeId: number
        +verifiedLength: number
        +verifiedWidth: number
        +verifiedHeight: number
        +startDatetime: Date
        +endDatetime: Date
        +driverName: string
        +driverSignaturePath: string
        +inspectorSignaturePath: string
        +sealUagaPostInspection: string
        +sealUagaPostLoading: string
        +sealShipper: string
        +sealRfb: string
        +sealVerificationRfbStatusId: number
        +sealVerificationShipperStatusId: number
        +sealVerificationTapeStatusId: number
        +sealVerificationResponsibleName: string
        +sealVerificationSignaturePath: string
        +sealVerificationDate: Date
        +observations: string
        +actionTaken: string
        +generatedPdfPath: string
        +createdAt: Date
        +updatedAt: Date
    }

    %% Relacionamentos (Associações)
    InspectionEntity "1" *-- "0..*" InspectionChecklistItemEntity : "possui (items)"

    InspectionEntity "*" o-- "1" LookupStatusEntity : "tem (status)"
    InspectionEntity "*" o-- "1" LookupModalityEntity : "tem (modality)"
    InspectionEntity "*" o-- "1" LookupOperationTypeEntity : "tem (operationType)"
    InspectionEntity "*" o-- "1" LookupUnitTypeEntity : "tem (unitType)"
    InspectionEntity "*" o-- "1" LookupContainerTypeEntity : "tem (containerType)"
   
    %% A mesma tabela de lookup pode ser referenciada múltiplas vezes
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationRfbStatus)"
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationShipperStatus)"
    InspectionEntity "*" o-- "1" LookupSealVerificationStatusEntity : "tem (sealVerificationTapeStatus)"
```

<h4>Como Ler Este Diagrama:</h4>
<ul>
<li><code><<Estereótipos>></code>: Indicam o "tipo" da classe. <code><<TypeORM Entity>></code> é uma classe mapeada para o banco, e <code><<Abstract>></code> é uma classe base.</li>
<li><code>*--</code> (Composição): A seta preenchida mostra que os <code>items</code> são "parte de" uma <code>InspectionEntity</code>. Se a inspeção for apagada, os seus itens também são.</li>
<li><code>o--</code> (Agregação): A seta vazia mostra que a <code>InspectionEntity</code> "tem uma" referência a uma entidade de Lookup, mas esta existe independentemente.</li>
</ul>

<hr>

<h3>2. Colaboração em Ação: O Fluxo de Finalização (Diagrama de Sequência)</h3>
<p>
Um diagrama de classes mostra a estrutura, mas um <strong>diagrama de sequência</strong> mostra a colaboração. Este diagrama detalha, passo a passo, como os diferentes componentes do sistema interagem ao longo do tempo para executar um dos nossos casos de uso mais críticos: a finalização de uma inspeção.
</p>

```mermaid
sequenceDiagram
    participant C as InspectionController
    participant UC as FinalizeInspectionUseCase
    participant Repo as IInspectionRepositoryPort
    participant Insp as Inspection (Model)
    
    C->>UC: execute(inspectionId)
    activate UC
    UC->>Repo: findById(inspectionId)
    activate Repo
    Repo-->>UC: inspection
    deactivate Repo
    
    UC->>Insp: isReadyToFinalize()
    activate Insp
    Insp-->>UC: true
    deactivate Insp
    
    UC->>Insp: calculateFinalStatus()
    activate Insp
    Insp-->>UC: APROVADO
    deactivate Insp
    
    UC->>Insp: finalize()
    activate Insp
    Insp-->>UC: 
    deactivate Insp
    
    UC->>Repo: save(inspection)
    activate Repo
    Repo-->>UC: inspectionFinalizada
    deactivate Repo
    
    UC-->>C: inspectionFinalizada
    deactivate UC
```

<h4>Como Ler Este Diagrama:</h4>
<ul>
<li><strong>Atores:</strong> Cada coluna representa um objeto ou classe.</li>
<li><strong>Linha do Tempo:</strong> A leitura é feita de cima para baixo.</li>
<li><strong>Setas:</strong> Indicam chamadas de métodos. As setas a tracejado indicam o retorno.</li>
<li><strong>O Padrão de Arquitetura em Ação:</strong> Note como o <code>Controller</code> apenas chama o <code>UseCase</code>. O <code>UseCase</code> orquestra tudo: ele busca o modelo de domínio (Inspection) através da porta do <code>Repository</code>, executa a lógica de negócio no próprio modelo e, finalmente, pede ao <code>Repository</code> para persistir o resultado.</li>
</ul>

<hr>

<h3>3. A Orquestração: Como o NestJS Conecta Tudo (Diagramas de Módulo)</h3>
<p>
Finalmente, os diagramas de módulo mostram como o NestJS, através de seu poderoso sistema de <strong>Injeção de Dependência</strong>, "conecta" todas as peças. Eles são a planta baixa da configuração do nosso contêiner de DI, demonstrando a aplicação prática do <strong>Princípio da Inversão de Dependência (SOLID)</strong>.
</p>

<h4>3.1 - O Módulo Principal: <code>InspectionModule</code></h4>

```mermaid
classDiagram
    direction TD
    class InspectionModule {
        <<NestJS Module>>
    }
    class InspectionController { <<ApiLayer>> }
    class ICreateInspectionUseCase { <<Interface>> DomainLayer }
    class CreateInspectionUseCaseImpl { DomainLayer }
    class IInspectionRepositoryPort { <<Interface>> DomainLayer }
    class InspectionRepository { <<Adapter>> InfraLayer }
    
    InspectionModule --* InspectionController : registra
    InspectionController --o ICreateInspectionUseCase : injeta ↘
    CreateInspectionUseCaseImpl --o IInspectionRepositoryPort : injeta ↘
    CreateInspectionUseCaseImpl ..|> ICreateInspectionUseCase : implementa
    InspectionRepository ..|> IInspectionRepositoryPort : implementa
```

<h4>3.2 - O Módulo de Suporte: <code>LookupModule</code></h4>

```mermaid
classDiagram
    direction LR
    class LookupModule { <<NestJS Module>> }
    class LookupController { <<ApiLayer>> }
    class IFindLookupsByTypeUseCase { <<Interface>> DomainLayer }
    class FindLookupsByTypeUseCaseImpl { DomainLayer }
    class ILookupRepositoryPort { <<Interface>> DomainLayer }
    class LookupRepository { <<Adapter>> InfraLayer }

    LookupModule --* LookupController : registra
    LookupController --o IFindLookupsByTypeUseCase : injeta ↘
    FindLookupsByTypeUseCaseImpl --o ILookupRepositoryPort : injeta ↘
    FindLookupsByTypeUseCaseImpl ..|> IFindLookupsByTypeUseCase : implementa
    LookupRepository ..|> ILookupRepositoryPort : implementa
```

<h4>Como Ler Estes Diagramas:</h4>
<ul>
<li><strong>Injeção de Dependência (--o):</strong> A seta com círculo vazio mostra a injeção. O ponto mais importante é que os componentes sempre dependem de <strong>abstrações</strong> (<code><<Interface>></code>), nunca de classes concretas de outras camadas. O <code>Controller</code> não "sabe" que <code>CreateInspectionUseCaseImpl</code> existe; ele apenas pede por <code>ICreateInspectionUseCase</code>.</li>
<li><strong>Implementação (..|&gt;):</strong> A seta pontilhada mostra qual classe concreta implementa uma interface. É no <code>providers</code> do Módulo que esta "ligação" é feita.</li>
</ul>