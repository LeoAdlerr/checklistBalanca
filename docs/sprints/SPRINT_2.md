<h1 id="sprint-2">Sprint 2: A Base para o Futuro</h1>

<h2 id="contexto-e-meta-da-sprint">Contexto e Meta da Sprint</h2>
<p>
    Após um profundo refinamento com a equipe de operação, o projeto evoluiu. A primeira sprint do novo escopo, com
    duração de <strong>2 semanas</strong> (10 dias úteis), de <strong>18 de Agosto a 29 de Agosto de 2025</strong>, tem
    como objetivo construir os pilares que sustentarão todo o futuro do desenvolvimento.
</p>
<p>
    <strong>Meta da Sprint (Sprint Goal):</strong> Construir e implantar o alicerce técnico (CI/CD, Deploy) e de
    segurança (Autenticação) do projeto, entregando o primeiro passo do novo fluxo de trabalho (Criação de Inspeção) em
    um ambiente de homologação funcional e estável.
</p>

<hr>

<h2 id="sprint-backlog">Sprint Backlog (Escopo de 32 Story Points)</h2>
<p>
    Para atender à meta da sprint, as seguintes Histórias de Usuário foram selecionadas do Product Backlog, totalizando
    <strong>32 de 33 pontos</strong> da capacidade da equipe.
</p>
<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left" style="width: 10%;"><b>ID</b></th>
            <th align="left" style="width: 50%;"><b>História de Usuário</b></th>
            <th align="left" style="width: 25%;"><b>Épico</b></th>
            <th align="center" style="width: 15%;"><b>Pontos (SP)</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>US-29</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> a aplicação implantada em homologação.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">8</td>
        </tr>
        <tr>
            <td><strong>US-04</strong></td>
            <td><strong>Como um</strong> usuário, <strong>eu quero</strong> me autenticar com email e senha.</td>
            <td>Gestão de Acesso e Perfis</td>
            <td align="center">8</td>
        </tr>
        <tr>
            <td><strong>US-28</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> ambientes docker-compose para testes unitários.
            </td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">5</td>
        </tr>
        <tr>
            <td><strong>US-33</strong></td>
            <td><strong>Como</strong> Dev, <strong>eu quero</strong> um ambiente de integração que simule a produção.
            </td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">5</td>
        </tr>
        <tr>
            <td><strong>US-34</strong></td>
            <td><strong>Como</strong> Equipe, <strong>eu quero</strong> um comando para executar os testes E2E.</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td><strong>US-17</strong></td>
            <td><strong>Como um</strong> Documental, <strong>eu quero</strong> criar uma nova inspeção com os dados
                iniciais.</td>
            <td>Fluxo de Inspeção</td>
            <td align="center">3</td>
        </tr>
        <tr bgcolor="#f2f2f2">
            <td colspan="3" align="right"><b>Total do Compromisso:</b></td>
            <td align="center"><b>32</b></td>
        </tr>
    </tbody>
</table>

<hr>

<h2 id="plano-de-execucao">Plano de Execução (Estratégia Refinada)</h2>
<p>
    Com base na filosofia de <strong>Trunk-Based Development</strong>, a equipe técnica refinou a ordem de execução para
    frontalizar a construção da infraestrutura de CI/CD e Deploy. Esta abordagem garante que toda funcionalidade
    subsequente seja desenvolvida e integrada em um ambiente estável e automatizado.
</p>
<ol>
    <li>
        <strong>Fase 1: Construção do Alicerce de Qualidade e Entrega</strong>
        <p><em>Foco em ter a "esteira" de produção pronta antes do primeiro "carro" ser montado.</em></p>
        <ul>
            <li><code>US-28</code>: Configurar ambientes Docker para testes unitários.</li>
            <li><code>US-33</code>: Montar o ambiente de integração simulando a produção.</li>
            <li><code>US-34</code>: Criar o comando unificado para execução dos testes E2E.</li>
            <li><code>US-29</code>: Realizar a implantação e configuração no ambiente de homologação.</li>
        </ul>
    </li>
    <li>
        <strong>Fase 2: Desenvolvimento das Funcionalidades sobre a Nova Base</strong>
        <p><em>Com a infraestrutura validada, o foco vira para a entrega de valor funcional.</em></p>
        <ul>
            <li><code>US-04</code>: Desenvolver a funcionalidade de autenticação.</li>
            <li><code>US-17</code>: Desenvolver a funcionalidade de criação de inspeção.</li>
        </ul>
    </li>
</ol>

<hr>

<h2 id="detalhamento-us">Detalhamento das Histórias de Usuário</h2>

<h4><strong>US-29: Implantação em Homologação</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Equipe, <strong>eu quero</strong> a aplicação implantada em um
        ambiente de homologação estável e de fácil manutenção, <strong>para que</strong> possamos validar as entregas em
        um ambiente fiel à produção.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-27</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>O servidor de homologação (IIS) deve ser configurado para servir a aplicação Backend (Node.js).</li>
            <li>O servidor de homologação (IIS) deve ser configurado para servir a aplicação Frontend (Vue.js SPA).</li>
            <li>Ambas as aplicações devem reiniciar automaticamente em caso de falha ou reboot do servidor.</li>
            <li>O processo de atualização via <code>git pull</code> deve estar funcional e documentado.</li>
            <li>A aplicação deve estar acessível através de uma URL interna de homologação.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-04: Autenticação com Email e Senha</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como um</strong> usuário, <strong>eu quero</strong> me autenticar no sistema
        usando meu email e senha, <strong>para que</strong> eu possa aceder de forma segura às funcionalidades do meu
        perfil.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-02</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Uma tela de login (<code>/login</code>) deve ser criada no frontend.</li>
            <li>Um endpoint <code>POST /auth/login</code> deve ser criado no backend.</li>
            <li>O backend deve validar as credenciais e retornar um token JWT em caso de sucesso.</li>
            <li>O frontend deve armazenar o token de forma segura e redirecionar para a dashboard principal
                (<code>/</code>).</li>
            <li>Todas as rotas da API e do frontend (exceto <code>/login</code>) devem ser protegidas, exigindo um token
                válido.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-28: Ambientes Docker-Compose para Testes</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Desenvolvedor, <strong>eu quero</strong> que os ambientes
        docker-compose dos sub-repositórios (backend, frontend) sejam capazes de executar a suíte de testes de forma
        isolada, <strong>para que</strong> a esteira de CI possa validar a qualidade de cada parte do sistema
        independentemente.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>O repositório do backend deve ter um <code>docker-compose.test.yml</code> que orquestre a API e um banco
                de dados de teste.</li>
            <li>Um comando (ex: <code>npm run test:ci</code>) deve executar a suíte de testes do backend dentro deste
                ambiente.</li>
            <li>O repositório do frontend deve ter um <code>docker-compose.test.yml</code>.</li>
            <li>Um comando (ex: <code>npm run test:ci</code>) deve executar a suíte de testes do frontend dentro do seu
                ambiente.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-33: Ambiente de Integração</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Desenvolvedor, <strong>eu quero</strong> um ambiente de
        integração no CI/CD principal que orquestre todos os serviços juntos, <strong>para que</strong> possamos
        executar testes de integração e E2E que validem o sistema como um todo.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Deve haver um <code>docker-compose.integration.yml</code> no repositório principal.</li>
            <li>Este arquivo deve orquestrar as builds de produção do frontend e do backend.</li>
            <li>Deve incluir um serviço de proxy reverso (Nginx) para simular o ambiente de produção.</li>
            <li>O ambiente completo deve ser inicializado com um único comando.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-34: Comando para Execução de Testes E2E</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como</strong> Equipe, <strong>eu quero</strong> um comando único e simples no
        CI/CD principal, <strong>para que</strong> possamos facilmente disparar a suíte de testes End-to-End no ambiente
        de integração.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RNF-26</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Um script (ex: <code>npm run test:e2e</code>) deve ser criado no <code>package.json</code> da raiz do
                projeto.</li>
            <li>Este script deve, em ordem: subir o ambiente de integração (US-33), rodar a suíte de testes E2E
                (Cypress) contra ele, e derrubar o ambiente no final.</li>
            <li>O script deve reportar sucesso apenas se todos os testes E2E passarem.</li>
        </ol>
    </li>
</ul>

<h4><strong>US-17: Criação de Nova Inspeção (Documental)</strong></h4>
<ul>
    <li><strong>História:</strong> <strong>Como um</strong> membro do time Documental, <strong>eu quero</strong> criar
        uma nova inspeção preenchendo seus dados iniciais, <strong>para que</strong> a inspeção seja registada no
        sistema e entre na fila de trabalho do inspetor.</li>
    <li><strong>Requisito(s) Atendido(s):</strong> RF-24</li>
    <li><strong>Critérios de Aceite:</strong>
        <ol>
            <li>Uma opção (botão ou menu) "Criar Nova Inspeção" deve estar disponível na dashboard principal para
                usuários logados.</li>
            <li>Um formulário deve permitir a inserção dos dados iniciais (modalidade, tipo de operação, tipo de
                contêiner, etc.).</li>
            <li>Ao salvar, uma nova inspeção deve ser criada no banco de dados com o status "Aguardando Inspeção".</li>
            <li>O usuário deve ser redirecionado para a dashboard, onde a nova inspeção deve ser visível.</li>
        </ol>
    </li>
</ul>

<hr>

<h2 id="acompanhamento">Acompanhamento da Sprint</h2>

<details>
    <summary> Tasks da Sprint 2 em detalhe: </summary>
    <table border="1" cellpadding="8" cellspacing="0" width="100%">
        <thead>
            <tr bgcolor="#f2f2f2">
                <th align="left" style="width: 15%;"><b>US Pai</b></th>
                <th align="left" style="width: 5%;"><b>ID da Task</b></th>
                <th align="left" style="width: 60%;"><b>Título da Task</b></th>
                <th align="center" style="width: 10%;"><b>Pontos (SP)</b></th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td valign="top" rowspan="4"><strong>US-29</strong> (8 SP)</td>
                <td>TASK-60</td>
                <td><code>[Deploy]</code> Configuração do IIS para o Backend (Node.js)</td>
                <td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-61</td>
                <td><code>[Deploy]</code> Configuração do IIS para o Frontend (Vue SPA)</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-62</td>
                <td><code>[Deploy]</code> Implementação do Fluxo de Atualização via Git</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-63</td>
                <td><code>[QA]</code> Validação e Teste de Fumaça do Ambiente</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td valign="top" rowspan="5"><strong>US-04</strong> (8 SP)</td>
                <td>TASK-64</td>
                <td><code>[BD]</code> Criar Tabela 'users'</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td>TASK-65</td>
                <td><code>[BE]</code> Implementar Lógica de Autenticação (Service e Strategies)</td>
                <td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-66</td>
                <td><code>[BE]</code> Configurar Camada de API (Módulo, Controller e Guard)</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td>TASK-67</td>
                <td><code>[FE]</code> Desenvolver Página de Login e Store Pinia</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-68</td>
                <td><code>[FE/Test]</code> Implementar Proteção de Rotas e Teste E2E</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td valign="top" rowspan="2"><strong>US-28</strong> (5 SP)</td>
                <td>TASK-69</td>
                <td><code>[DevOps]</code> Configurar Ambiente de Testes Unitários do Backend</td>
                <td align="center">3</td>
            </tr>
            <tr>
                <td>TASK-70</td>
                <td><code>[DevOps]</code> Configurar Ambiente de Testes Unitários do Frontend</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td valign="top" rowspan="3"><strong>US-33</strong> (5 SP)</td>
                <td>TASK-71</td>
                <td><code>[DevOps]</code> Orquestrar o Backend em Modo de Produção</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td>TASK-72</td>
                <td><code>[DevOps]</code> Criar Imagem de Produção do Frontend com Nginx</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-73</td>
                <td><code>[DevOps]</code> Integrar e Configurar a Rede dos Serviços</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td valign="top" rowspan="2"><strong>US-34</strong> (3 SP)</td>
                <td>TASK-74</td>
                <td><code>[DevOps]</code> Criar Serviço Docker-Compose para o Cypress Runner</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-75</td>
                <td><code>[DevOps]</code> Criar o Script de Orquestração dos Testes E2E</td>
                <td align="center">1</td>
            </tr>
            <tr>
                <td valign="top" rowspan="2"><strong>US-17</strong> (3 SP)</td>
                <td>TASK-76</td>
                <td><code>[BE]</code> Criar Endpoint para Nova Inspeção</td>
                <td align="center">2</td>
            </tr>
            <tr>
                <td>TASK-77</td>
                <td><code>[FE]</code> Desenvolver Fluxo de Criação de Inspeção</td>
                <td align="center">2</td>
            </tr>
        </tbody>
        <tfoot>
            <tr bgcolor="#f2f2f2">
                <td align="right" colspan="3"><strong>Total de Tarefas / Pontos da Sprint:</strong></td>
                <td align="center"><strong>18 / 33</strong></td>
            </tr>
        </tfoot>
    </table>
</details>

<hr>

<p>
    Esta seção será atualizada com o gráfico Burndown ao final da sprint para visualizarmos o progresso do trabalho
    realizado.
</p>