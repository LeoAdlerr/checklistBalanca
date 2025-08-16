<h1 id="sprint-2">Sprint 2: Rumo ao MVP Final & Homologação</h1>

<h2 id="contexto">Contexto e Meta da Sprint</h2>
<p>
    Após a validação da Prova de Conceito na Sprint 1, um refinamento técnico detalhado revelou o escopo completo necessário para que a aplicação atinja o status de <strong>MVP (Minimum Viable Product)</strong> e possa ser liberada para a homologação.
</p>
<p>
    A <strong>meta principal da Sprint 2</strong>, agora planeada para <strong>4 semanas (20 dias úteis)</strong>, de <strong>18 de Agosto a 12 de Setembro de 2025</strong>, é implementar todas as funcionalidades essenciais de segurança, integridade legal, usabilidade e flexibilidade do negócio.
</p>

<hr>

<h2 id="sprint-backlog">Sprint Backlog (Escopo de 65 Story Points)</h2>
<p>
    Para atender à meta da sprint, as seguintes Histórias de Usuário e Tarefas Técnicas foram selecionadas e estimadas detalhadamente:
</p>
<table border="1" cellpadding="10" cellspacing="0" width="100%">
    <thead>
        <tr bgcolor="#f2f2f2">
            <th align="left"><b>ID</b></th>
            <th align="left"><b>Título</b></th>
            <th align="left"><b>Épico</b></th>
            <th align="center"><b>Pontos (Refinado)</b></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>US-04</strong></td>
            <td>Login de usuário com base para permissões</td>
            <td>Gestão de Acesso</td>
            <td align="center">15</td>
        </tr>
        <tr>
            <td><strong>DevOps</strong></td>
            <td>Setup, Configuração e Melhorias do Ambiente CI/CD</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">12</td>
        </tr>
        <tr>
            <td><strong>Deploy</strong></td>
            <td>Deploy e Configuração do Ambiente de Homologação</td>
            <td>Infraestrutura e DevOps</td>
            <td align="center">9</td>
        </tr>
        <tr>
            <td><strong>US-13</strong></td>
            <td>Apresentar checklist dinâmico (8 ou 18 pontos)</td>
            <td>Gestão de Inspeções (Core)</td>
            <td align="center">6</td>
        </tr>
        <tr>
            <td><strong>US-15</strong></td>
            <td>Geração de Relatório Fotográfico separado</td>
            <td>Finalização e Relatórios</td>
            <td align="center">6</td>
        </tr>
        <tr>
            <td><strong>US-10</strong></td>
            <td>Captura de assinaturas digitais na tela</td>
            <td>Finalização e Relatórios</td>
            <td align="center">5</td>
        </tr>
        <tr>
            <td><strong>US-07</strong></td>
            <td>Navegação guiada para o próximo item</td>
            <td>Melhorias de Usabilidade</td>
            <td align="center">4</td>
        </tr>
        <tr>
            <td><strong>US-16</strong></td>
            <td>Armazenamento de relatórios em pastas organizadas</td>
            <td>Finalização e Relatórios</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td><strong>TASK-03</strong></td>
            <td>Criação do Manual do Usuário (MANUAL_USUARIO.md)</td>
            <td>Documentação</td>
            <td align="center">3</td>
        </tr>
        <tr>
            <td><strong>US-14</strong></td>
            <td>Limitar evidência a uma foto por item</td>
            <td>Gestão de Inspeções (Core)</td>
            <td align="center">2</td>
        </tr>
        <tr bgcolor="#f2f2f2">
            <td colspan="3" align="right"><b>Total Estimado:</b></td>
            <td align="center"><b>65</b></td>
        </tr>
    </tbody>
</table>

<hr>

<h2 id="plano-execucao">Plano de Execução e Estratégia (4 Semanas)</h2>

<h3>Estratégia: "Primeiro o Alicerce"</h3>
<p>
    A execução seguirá uma ordem estratégica para atacar os maiores riscos e complexidades no início, garantindo um caminho mais previsível para a conclusão.
</p>

<h4>Semana 1 (18/08 – 22/08): Foco em Segurança e Base de DevOps</h4>
<ul>
    <li><strong>Itens Prioritários:</strong> US-04 (Autenticação - 15 SP).</li>
    <li><strong>Meta da Semana:</strong> Ter o fluxo de autenticação 100% funcional e a cumprir o DoD. Esta é a base para todo o resto.</li>
</ul>

<h4>Semana 2 (25/08 – 29/08): Foco em Infraestrutura e Deploy</h4>
<ul>
    <li><strong>Itens Prioritários:</strong> Tarefas de DevOps (12 SP) e Deploy (9 SP).</li>
    <li><strong>Meta da Semana:</strong> Ter o ambiente de homologação 100% configurado, otimizado e a aplicação a rodar nele, com o login funcional.</li>
</ul>

<h4>Semana 3 (01/09 – 05/09): Foco no Core do Negócio</h4>
<ul>
    <li><strong>Itens Prioritários:</strong> US-13 (Checklist Dinâmico - 6 SP), US-10 (Assinaturas - 5 SP), US-15 (Relatório Fotográfico - 6 SP).</li>
    <li><strong>Meta da Semana:</strong> Implementar as funcionalidades mais críticas do ponto de vista do usuário final.</li>
</ul>

<h4>Semana 4 (08/09 – 12/09): Foco em Refinamento, Finalização e Buffer</h4>
<ul>
    <li><strong>Itens Prioritários:</strong> US-07, US-16, US-14, TASK-03 (Manual).</li>
    <li><strong>Meta da Semana:</strong> Finalizar todas as funcionalidades restantes, escrever o manual do usuário e utilizar o tempo restante como buffer para garantir que 100% do escopo cumpra o DoD.</li>
</ul>

<hr>

<h2 id="detalhamento-us">Detalhamento das Histórias de Usuário e Tarefas</h2>
<p>
    <em>(Esta seção permanece a mesma do planeamento anterior, com a adição da TASK-03 e dos novos IDs das tarefas)</em>
</p>
<details>
    <summary><strong>Clique para expandir o detalhamento completo das 37 tarefas</strong></summary>
    <br>
<table border="1" cellpadding="8" cellspacing="0" width="100%">
<thead>
<tr bgcolor="#f2f2f2">
<th align="left">US/Grupo Pai</th>
<th align="left">ID da Task</th>
<th align="left">Título da Task</th>
<th align="center">Pontos (SP)</th>
</tr>
</thead>
<tbody>
<tr>
<td valign="top" rowspan="8"><strong>US-04</strong> (15 SP)</td>
<td>TASK-23</td><td><code>[BD]</code> Estrutura da Tabela de Usuários</td><td align="center">1</td>
</tr>
<tr><td>TASK-24</td><td><code>[BE]</code> Implementação do Módulo de Autenticação</td><td align="center">3</td></tr>
<tr><td>TASK-25</td><td><code>[BE]</code> Criação do Endpoint de Login</td><td align="center">2</td></tr>
<tr><td>TASK-26</td><td><code>[BE]</code> Proteção de Rotas com Guard</td><td align="center">2</td></tr>
<tr><td>TASK-27</td><td><code>[FE]</code> Desenvolvimento da Página de Login</td><td align="center">2</td></tr>
<tr><td>TASK-28</td><td><code>[FE]</code> Criação da Store de Autenticação (Pinia)</td><td align="center">2</td></tr>
<tr><td>TASK-29</td><td><code>[FE]</code> Implementação da Proteção de Rotas</td><td align="center">2</td></tr>
<tr><td>TASK-30</td><td><code>[Test]</code> Teste E2E do Fluxo de Login</td><td align="center">1</td></tr>
<tr>
<td valign="top" rowspan="3"><strong>US-13</strong> (6 SP)</td>
<td>TASK-31</td><td><code>[BD]</code> Refatorar Status do Checklist (Remover N/A)</td><td align="center">1</td>
</tr>
<tr><td>TASK-32</td><td><code>[BE]</code> Implementar Lógica de Criação de Checklist Dinâmico</td><td align="center">3</td></tr>
<tr><td>TASK-33</td><td><code>[FE]</code> Adaptar Tela do Checklist para Itens Dinâmicos</td><td align="center">2</td></tr>
<tr>
<td valign="top" rowspan="4"><strong>US-15</strong> (6 SP)</td>
<td>TASK-34</td><td><code>[BE]</code> Criar Lógica para Coleta de Evidências Ordenadas</td><td align="center">1</td>
</tr>
<tr><td>TASK-35</td><td><code>[BE]</code> Desenvolver Serviço de Geração de PDF Fotográfico</td><td align="center">3</td></tr>
<tr><td>TASK-36</td><td><code>[BE]</code> Criar Endpoint para o Relatório Fotográfico</td><td align="center">1</td></tr>
<tr><td>TASK-37</td><td><code>[FE]</code> Adicionar Botão de Download na Interface</td><td align="center">1</td></tr>
<tr>
<td valign="top" rowspan="3"><strong>US-16</strong> (3 SP)</td>
<td>TASK-38</td><td><code>[BE]</code> Criar/Abstrair Serviço de Gerenciamento de Arquivos</td><td align="center">1</td>
</tr>
<tr><td>TASK-39</td><td><code>[BE]</code> Implementar Armazenamento do Relatório Principal</td><td align="center">1</td></tr>
<tr><td>TASK-40</td><td><code>[BE]</code> Implementar Armazenamento do Relatório Fotográfico</td><td align="center">1</td></tr>
<tr>
<td valign="top" rowspan="3"><strong>US-10</strong> (5 SP)</td>
<td>TASK-41</td><td><code>[FE]</code> Desenvolver/Integrar Componente de Assinatura</td><td align="center">2</td>
</tr>
<tr><td>TASK-42</td><td><code>[FE]</code> Integrar Componentes na Tela de Finalização</td><td align="center">1</td></tr>
<tr><td>TASK-43</td><td><code>[BE]</code> Adaptar API para Receber e Salvar Assinaturas</td><td align="center">2</td></tr>
<tr>
<td valign="top" rowspan="2"><strong>US-07</strong> (4 SP)</td>
<td>TASK-46</td><td><code>[FE]</code> Estender Store Pinia com Lógica de Itens Pendentes</td><td align="center">2</td>
</tr>
<tr><td>TASK-47</td><td><code>[FE]</code> Implementar Navegação Guiada na Interface</td><td align="center">2</td></tr>
<tr>
<td valign="top" rowspan="2"><strong>US-14</strong> (2 SP)</td>
<td>TASK-48</td><td><code>[BE]</code> Implementar Validação de Limite de Evidência</td><td align="center">1</td>
</tr>
<tr><td>TASK-49</td><td><code>[FE]</code> Adaptar Interface de Upload de Evidência</td><td align="center">1</td></tr>
<tr>
<td valign="top" rowspan="5"><strong>DevOps</strong> (12 SP)</td>
<td>TASK-50</td><td><code>[DevOps]</code> Corrigir o Ambiente de Build do Frontend</td><td align="center">3</td>
</tr>
<tr><td>TASK-51</td><td><code>[DevOps]</code> Otimizar Dockerfile do Backend (Slim + Puppeteer)</td><td align="center">2</td></tr>
<tr><td>TASK-52</td><td><code>[DevOps]</code> Manutenção dos Ambientes docker-compose de Dev</td><td align="center">2</td></tr>
<tr><td>TASK-53</td><td><code>[DevOps]</code> Criar Ambiente de Integração com Nginx</td><td align="center">3</td></tr>
<tr><td>TASK-54</td><td><code>[DevOps]</code> Integrar Suite de Testes E2E ao Ambiente de Integração</td><td align="center">2</td></tr>
<tr>
<td valign="top" rowspan="4"><strong>Deploy</strong> (9 SP)</td>
<td>TASK-55</td><td><code>[Deploy]</code> Configuração do IIS para o Backend (Node.js)</td><td align="center">3</td>
</tr>
<tr><td>TASK-56</td><td><code>[Deploy]</code> Configuração do IIS para o Frontend (Vue SPA)</td><td align="center">2</td></tr>
<tr><td>TASK-57</td><td><code>[Deploy]</code> Implementação do Fluxo de Atualização via Git</td><td align="center">3</td></tr>
<tr><td>TASK-58</td><td><code>[QA]</code> Validação e Teste de Fumaça do Ambiente Completo</td><td align="center">1</td></tr>
<tr>
<td><strong>Docs</strong> (3 SP)</td>
<td>TASK-59</td><td><code>[DOC]</code> Criação do Manual do Usuário</td><td align="center">3</td>
</tr>
</tbody>
</table>
</details>

<hr>
<h2 id="acompanhamento">Acompanhamento da Sprint</h2>
<p>
    Esta seção será atualizada com o gráfico Burndown ao final da sprint para visualizarmos o progresso do trabalho
    realizado.
</p>
<div align="center">
    <p><em>(Gráfico Burndown da Sprint 2 a ser inserido aqui)</em></p>
</div>