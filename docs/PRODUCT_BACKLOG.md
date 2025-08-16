<h1 id="product-backlog">🎯 Product Backlog</h1>
<p>
    Este documento é a fonte única da verdade para todos os requisitos, funcionalidades e melhorias do projeto. Ele
    serve para garantir que o trabalho de desenvolvimento esteja sempre alinhado com as necessidades de negócio.
</p>

<hr>

<h2 id="status-sprints">Status Atual e Navegação entre Sprints</h2>
<p>
    O desenvolvimento do projeto é organizado em Sprints, com cada uma tendo um objetivo claro. Abaixo, um resumo do
    progresso e links para o detalhamento de cada fase:
</p>
<ul>
    <li>
        <p>
            <strong>Sprint 1 (Concluída em 08 de Agosto de 2025):</strong> Entregamos a Prova de Conceito (PoC) e o
            fluxo principal da
            aplicação, validando a arquitetura e as funcionalidades core do produto.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_1.md">Ver Retrospectiva e Entregas da Sprint 1</a></strong>
        </p>
    </li>
    <li>
        <p>
            <strong>Sprint 2 (Planejamento Concluído):</strong> Com o escopo de <strong>65 Story Points</strong>, esta
            sprint tem o objetivo de implementar os 7 requisitos essenciais que transformarão a PoC no <strong>MVP
                final</strong>, pronto para a homologação. O desenvolvimento inicia em <strong>18 de Agosto de
                2025</strong>.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_2.md">Ver Planejamento Detalhado da Sprint 2</a></strong>
        </p>
    </li>
</ul>
<hr>

<h2 id="requisitos-de-negocio">📋 Requisitos de Negócio</h2>
<p>
    Abaixo estão listados todos os requisitos de negócio levantados até o momento, com seus respectivos identificadores
    (REQ-XX) para rastreabilidade.
</p>

<h3>Requisitos Entregues (MVP - Sprint 1)</h3>
<ul>
    <li><strong>(REQ-08)</strong> Criação de Nova Inspeção</li>
    <li><strong>(REQ-09)</strong> Digitalização do Checklist</li>
    <li><strong>(REQ-10)</strong> Registro de Status e Observações</li>
    <li><strong>(REQ-11)</strong> Anexo de Evidências Fotográficas</li>
    <li><strong>(REQ-12)</strong> Geração de Relatório em PDF</li>
    <li><strong>(REQ-13)</strong> Gestão e Histórico de Inspeções</li>
    <li><strong>(REQ-14)</strong> Determinação de Resultado Automático</li>
</ul>

<h3>Requisitos Planejados (Sprint 2)</h3>
<ul>
    <li><strong>(REQ-01)</strong> Navegação Guiada no Checklist</li>
    <li><strong>(REQ-02)</strong> Autenticação e Controle de Acesso</li>
    <li><strong>(REQ-03)</strong> Assinaturas Digitais</li>
    <li><strong>(REQ-04)</strong> Checklist Dinâmico (8 ou 18 Pontos)</li>
    <li><strong>(REQ-05)</strong> Novos Tipos de Relatório</li>
    <li><strong>(REQ-06)</strong> Limite de Uma Foto por Item</li>
    <li><strong>(REQ-07)</strong> Armazenamento Organizado de Relatórios</li>
</ul>

<hr>

<h2 id="user-stories">📑 Histórias de Usuário e Tarefas</h2>
<p>
    A tabela a seguir mapeia cada item do backlog ao requisito que ele atende, detalhando seu épico e estimativa.
</p>

<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left"><b>Épico</b></th>
            <th align="left"><b>ID</b></th>
            <th align="left"><b>Título</b></th>
            <th align="left"><b>Requisito Atendido</b></th>
            <th align="center"><b>Pontos (SP)</b></th>
            <th align="left"><b>Status</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td valign="top" rowspan="5">Gestão de Inspeções (Core)</td>
            <td><strong>US-01</strong></td>
            <td>Iniciar um novo checklist...</td>
            <td align="center"><strong>REQ-08</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue</b></td>
        </tr>
        <tr>
            <td><strong>US-02</strong></td>
            <td>Avaliar cada um dos 18 pontos...</td>
            <td align="center"><strong>REQ-09, 10, 11</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue</b></td>
        </tr>
        <tr>
            <td><strong>US-03</strong></td>
            <td>Finalizar o checklist...</td>
            <td align="center"><strong>REQ-14</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue</b></td>
        </tr>
        <tr>
            <td><strong>US-13</strong></td>
            <td>Apresentar checklist dinâmico (8 ou 18 pontos)</td>
            <td align="center"><strong>REQ-04</strong></td>
            <td align="center">6</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td><strong>US-14</strong></td>
            <td>Limitar evidência a uma foto por item</td>
            <td align="center"><strong>REQ-06</strong></td>
            <td align="center">2</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Relatórios e Análise</td>
            <td><strong>US-05</strong></td>
            <td>Gerar um relatório em PDF...</td>
            <td align="center"><strong>REQ-12</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue</b></td>
        </tr>
        <tr>
            <td><strong>US-06</strong></td>
            <td>Acessar um dashboard com a listagem...</td>
            <td align="center"><strong>REQ-13</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="3">Gestão de Acesso</td>
            <td><strong>US-04</strong></td>
            <td>Login de usuário com base para permissões</td>
            <td align="center"><strong>REQ-02</strong></td>
            <td align="center">15</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td><strong>US-08</strong></td>
            <td>Visualizar apenas inspeções permitidas</td>
            <td align="center"><strong>REQ-02</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#eeeeee">💡 <b>Backlog</b></td>
        </tr>
        <tr>
            <td><strong>US-09</strong></td>
            <td>Interface de admin para gerenciar permissões</td>
            <td align="center"><strong>REQ-02</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#eeeeee">💡 <b>Backlog</b></td>
        </tr>
        <tr>
            <td>Melhorias de Usabilidade</td>
            <td><strong>US-07</strong></td>
            <td>Navegação guiada para o próximo item</td>
            <td align="center"><strong>REQ-01</strong></td>
            <td align="center">4</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="3">Finalização e Relatórios</td>
            <td><strong>US-10</strong></td>
            <td>Captura de assinaturas digitais na tela</td>
            <td align="center"><strong>REQ-03</strong></td>
            <td align="center">5</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td><strong>US-15</strong></td>
            <td>Geração de Relatório Fotográfico separado</td>
            <td align="center"><strong>REQ-05</strong></td>
            <td align="center">6</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td><strong>US-16</strong></td>
            <td>Armazenamento de relatórios em pastas</td>
            <td align="center"><strong>REQ-07</strong></td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Infraestrutura e DevOps</td>
            <td><strong>DevOps</strong></td>
            <td>Setup e Melhorias do Ambiente CI/CD</td>
            <td align="center"><strong>N/A</strong></td>
            <td align="center">12</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td><strong>Deploy</strong></td>
            <td>Deploy e Config. do Ambiente de Homologação</td>
            <td align="center"><strong>N/A</strong></td>
            <td align="center">9</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td>Documentação</td>
            <td><strong>TASK-03</strong></td>
            <td>Criação do Manual do Usuário</td>
            <td align="center"><strong>N/A</strong></td>
            <td align="center">3</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td>Melhorias de Usabilidade</td>
            <td><strong>US-12</strong></td>
            <td>Salvar e gerenciar assinatura no perfil</td>
            <td align="center"><strong>REQ-03</strong></td>
            <td align="center">N/A</td>
            <td valign="top" bgcolor="#FFF3E0">📅 <b>Sprint 3</b></td>
        </tr>
        <tr bgcolor="#f2f2f2">
            <td colspan="4" align="right"><b>Total de Pontos (Sprint 2):</b></td>
            <td align="center"><b>65</b></td>
            <td></td>
        </tr>
    </tbody>
</table>