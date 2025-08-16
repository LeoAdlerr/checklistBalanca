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
            <strong>Sprint 1 (Concluída):</strong> Nesta fase, entregamos a Prova de Conceito e o fluxo principal da
            aplicação, validando a arquitetura e as funcionalidades core.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_1.md">Ver Retrospectiva e Entregas da Sprint 1</a></strong>
        </p>
    </li>
    <li>
        <p>
            <strong>Sprint 2 (Em Planejamento):</strong> O objetivo desta sprint é implementar os 7 requisitos
            essenciais que transformarão a PoC no MVP final, pronto para a homologação com os usuários.
            <br>
            ➡️ <strong><a href="./sprints/SPRINT_2.md">Ver Planejamento Detalhado da Sprint 2</a></strong>
        </p>
    </li>
</ul>
<hr>

<h2 id="requisitos-de-negocio">📋 Requisitos de Negócio</h2>
<p>
    Abaixo estão listados todos os requisitos de negócio levantados até o momento. Cada requisito possui um
    identificador único (REQ-XX) para permitir a rastreabilidade direta com as Histórias de Usuário na tabela a seguir.
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

<h2 id="user-stories">📑 Histórias de Usuário (User Stories)</h2>
<p>
    A tabela a seguir mapeia cada História de Usuário ao requisito de negócio que ela atende, detalhando seu épico e
    status atual no ciclo de desenvolvimento.
</p>

<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left"><b>Épico</b></th>
            <th align="left"><b>ID</b></th>
            <th align="left"><b>História de Usuário (User Story)</b></th>
            <th align="left"><b>Requisito Atendido</b></th>
            <th align="left"><b>Status</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td valign="top" rowspan="5">Gestão de Inspeções (Core)</td>
            <td valign="top"><strong>US-01</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> iniciar um novo checklist...
            </td>
            <td valign="top" align="center"><strong>REQ-08</strong></td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue (Sprint 1)</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-02</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> avaliar cada um dos 18
                pontos...</td>
            <td valign="top" align="center"><strong>REQ-09, 10, 11</strong></td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue (Sprint 1)</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-03</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> finalizar o checklist...</td>
            <td valign="top" align="center"><strong>REQ-14</strong></td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue (Sprint 1)</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-13</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> que o sistema me apresente o
                checklist correto (8 ou 18 pontos)...</td>
            <td valign="top" align="center"><strong>REQ-04</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-14</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> poder anexar no máximo uma
                foto de evidência por item...</td>
            <td valign="top" align="center"><strong>REQ-06</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Relatórios e Análise</td>
            <td valign="top"><strong>US-05</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> que um relatório em PDF seja
                gerado...</td>
            <td valign="top" align="center"><strong>REQ-12</strong></td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue (Sprint 1)</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-06</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> acessar um dashboard com a
                listagem das inspeções...</td>
            <td valign="top" align="center"><strong>REQ-13</strong></td>
            <td valign="top" bgcolor="#e8f5e9">✅ <b>Entregue (Sprint 1)</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="3">Gestão de Acesso</td>
            <td valign="top"><strong>US-04</strong></td>
            <td valign="top"><strong>Como um</strong> membro da equipe, <strong>eu quero</strong> fazer login com meu
                usuário e senha...</td>
            <td valign="top" align="center"><strong>REQ-02</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-08</strong></td>
            <td valign="top"><strong>Como um</strong> usuário autenticado, <strong>eu quero</strong> visualizar apenas
                os tipos de inspeção para os quais tenho permissão...</td>
            <td valign="top" align="center"><strong>REQ-02</strong></td>
            <td valign="top" bgcolor="#eeeeee">💡 <b>Backlog</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-09</strong></td>
            <td valign="top"><strong>Como um</strong> Administrador, <strong>eu quero</strong> uma interface para
                criar/editar usuários e atribuir permissões...</td>
            <td valign="top" align="center"><strong>REQ-02</strong></td>
            <td valign="top" bgcolor="#eeeeee">💡 <b>Backlog</b></td>
        </tr>
        <tr>
            <td valign="top">Melhorias de Usabilidade</td>
            <td valign="top"><strong>US-07</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> ser guiado para o próximo item
                de checklist não preenchido...</td>
            <td valign="top" align="center"><strong>REQ-01</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="4">Finalização e Relatórios</td>
            <td valign="top"><strong>US-10</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> capturar assinaturas
                digitalmente na tela...</td>
            <td valign="top" align="center"><strong>REQ-03</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-11</strong></td>
            <td valign="top"><strong>Como um</strong> sistema, <strong>eu quero</strong> gerar um relatório PDF dinâmico
                (8 ou 18 pontos) e assinado...</td>
            <td valign="top" align="center"><strong>REQ-05</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-15</strong></td>
            <td valign="top"><strong>Como um</strong> inspetor, <strong>eu quero</strong> poder gerar um relatório PDF
                separado contendo apenas as imagens...</td>
            <td valign="top" align="center"><strong>REQ-05</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>US-16</strong></td>
            <td valign="top"><strong>Como um</strong> sistema, <strong>eu quero</strong> armazenar os relatórios gerados
                em uma estrutura de pastas organizada...</td>
            <td valign="top" align="center"><strong>REQ-07</strong></td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top" rowspan="2">Infraestrutura e DevOps</td>
            <td valign="top"><strong>TASK-01</strong></td>
            <td valign="top">Setup e Configuração do Ambiente CI/CD para Homologação.</td>
            <td valign="top" align="center">N/A</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top"><strong>TASK-02</strong></td>
            <td valign="top">Deploy da Aplicação em Ambiente de Homologação.</td>
            <td valign="top" align="center">N/A</td>
            <td valign="top" bgcolor="#fffde7">📅 <b>Sprint 2</b></td>
        </tr>
        <tr>
            <td valign="top">Melhorias de Usabilidade</td>
            <td valign="top"><strong>US-12</strong></td>
            <td valign="top"><strong>Como um</strong> usuário registrado, <strong>eu quero</strong> poder salvar e
                gerenciar uma imagem da minha assinatura...</td>
            <td valign="top" align="center"><strong>REQ-03</strong></td>
            <td valign="top" bgcolor="#FFF3E0">📅 <b>Sprint 3</b></td>
        </tr>
    </tbody>
</table>