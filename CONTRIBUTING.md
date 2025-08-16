<h1 id="guia-de-contribuicao">🤝 Guia de Contribuição e Fluxo de Desenvolvimento</h1>
<p>
    Bem-vindo ao guia de contribuição! Este documento explica como nosso processo de desenvolvimento funciona,
    garantindo que mantemos um código de alta qualidade, estável e que entregamos valor de forma consistente.
</p>

<h2 id="filosofia">Nossa Filosofia de Desenvolvimento</h2>
<p>
    Antes de detalhar o processo, é importante entender os conceitos que guiam nosso trabalho.
</p>
<h4>Trunk-Based Development & Integração Contínua</h4>
<p>
    Nós utilizamos uma abordagem de <strong>Trunk-Based Development (TBD)</strong>. Isso significa que todas as nossas
    alterações são integradas diretamente e com frequência na branch principal (<code>main</code>). Ao integrar o código
    em pequenas partes várias vezes ao dia, nós
    praticamente eliminamos os "merge hells" ao fim das sprints e mantemos a branch <code>main</code>
    <strong>sempre estável e pronta para deploy</strong>. Essa prática é o coração da <strong>Integração Contínua
        (CI)</strong>.
</p>
<blockquote>
    <em><strong>Para aprofundar:</strong> Martin Fowler escreveu o artigo seminal sobre <a
            href="https://martinfowler.com/articles/continuousIntegration.html" target="_blank"
            rel="noopener noreferrer">Integração Contínua</a>.</em>
</blockquote>

<h4>Qualidade é Inegociável</h4>
<p>
    Nossa filosofia é simples: <strong>uma tarefa sem documentação e sem testes é uma tarefa incompleta</strong>. A
    qualidade não é uma etapa final, mas sim uma parte integral de cada passo do desenvolvimento.
</p>
<hr>

<h2 id="dor-dod">🏁 Definition of Ready (DoR) & Definition of Done (DoD)</h2>
<p>
    No nosso processo, DoR e DoD são os portões de qualidade que governam nosso fluxo de trabalho. O
    <strong>DoR</strong> garante que uma tarefa está pronta para <strong>começar</strong>, e o <strong>DoD</strong>
    garante que ela está realmente <strong>terminada</strong>.
</p>
<p>
    É crucial entender que os guias abaixo são o nosso <strong>"Contrato Geral de Qualidade"</strong>. Cada Épico, User
    Story (US) e Tarefa específica terá seus próprios critérios de DoR e DoD, que devem ser inspirados e alinhados a
    este guia mestre.
</p>

<h3 id="dor">Definition of Ready (DoR) – "Estamos prontos para começar?"</h3>
<p>
    O DoR é um checklist que previne que o desenvolvimento comece em cima de incertezas. Uma tarefa só pode ser movida
    para "Em Desenvolvimento" se atender aos seguintes critérios gerais:
</p>
<ul>
    <li>✅ <strong>Clareza do Negócio:</strong> O "porquê" da tarefa está claro. Entendemos qual problema do usuário ou
        requisito de negócio ela resolve.</li>
    <li>✅ <strong>Critérios de Aceite Definidos:</strong> A tarefa possui uma lista clara e objetiva do que define o
        sucesso da implementação.</li>
    <li>✅ <strong>Dependências Mapeadas:</strong> Quaisquer dependências (outras tarefas, APIs externas, acesso a
        sistemas) foram identificadas e, se possível, resolvidas.</li>
    <li>✅ <strong>Escopo Técnico Alinhado:</strong> A abordagem técnica geral foi discutida e acordada. Não há dúvidas
        maiores sobre a arquitetura ou a tecnologia a ser usada.</li>
</ul>
<blockquote>
    <strong>Exemplo de DoR específico de uma tarefa:</strong> Para uma tarefa de "Criar Use Case de Inspeção", um DoR
    específico poderia ser "✅ O Repositório da entidade Inspeção já foi implementado, testado e mergeado na main".
</blockquote>

<h3 id="dod">Definition of Done (DoD) – "Realmente terminamos?"</h3>
<p>
    O DoD é o nosso checklist final. Uma tarefa, PR ou US só pode ser considerada <strong>pronta</strong> quando atende
    a <strong>todos</strong> os critérios do nosso Contrato de Qualidade.
</p>
<blockquote>
    <strong>Exemplo de DoD específico de uma tarefa:</strong> Para a mesma tarefa de "Criar Use Case", um DoD específico
    seria "✅ Os testes unitários do novo Use Case cobrem 100% dos cenários de sucesso e falha". Isso complementa o guia
    geral abaixo.
</blockquote>

<h4>Nosso Contrato de Qualidade Geral (DoD Mestre)</h4>
<h5>1. Qualidade do Código e Processo</h5>
<ul>
    <li>✅ <strong>Implementação:</strong> O código implementa todos os Critérios de Aceite da tarefa.</li>
    <li>✅ <strong>Padrões:</strong> O código adere aos padrões SOLID, DDD e de estilo definidos para o projeto.</li>
    <li>✅ <strong>Revisão de Código:</strong> A PR foi revisada e aprovada por, no mínimo, um colega.</li>
</ul>

<h5>2. Testes e Validação</h5>
<ul>
    <li>✅ <strong>Testes Unitários:</strong> A nova lógica está coberta por testes unitários significativos.</li>
    <li>✅ <strong>Testes E2E:</strong> O fluxo do usuário relacionado à mudança está coberto por testes E2E.</li>
    <li>✅ <strong>Suíte de Testes Passando:</strong> O pipeline de CI (<code>podman-compose up</code>) executa com 100%
        de sucesso.</li>
</ul>

<h5>3. Documentação (Não-Negociável)</h5>
<ul>
    <li>✅ <strong>Código Comentado:</strong> O código está claro e comentado onde a lógica é complexa.</li>
    <li>✅ <strong>Documentação do Projeto:</strong> Os <code>READMEs</code>, diagramas ou a documentação do Swagger
        foram atualizados para refletir as mudanças.</li>
</ul>
<hr>

<h2>O Processo de Contribuição Passo a Passo</h2>
<ol>
    <li>
        <h4><strong>Passo 1: Criando sua Feature Branch (Conforme DoR)</strong></h4>
        <p>Todo o trabalho começa a partir da branch <code>main</code>.</p>
        <ul>
            <li>
                <strong>Atualize sua <code>main</code> local:</strong>
                <pre><code>git checkout main
git pull origin main</code></pre>
            </li>
            <li>
                <strong>Crie sua branch</strong> seguindo a convenção de nomenclatura abaixo.
            </li>
        </ul>
        <blockquote>
            <p><strong>Convenção de Nomenclatura de Branch:</strong><br>
                <code>&lt;prefixo&gt;/&lt;repo&gt;-&lt;id-da-task&gt;-&lt;nome-da-task&gt;</code>
            </p>
            <ul>
                <li><strong>Prefixos:</strong> <code>feat</code>, <code>fix</code>, <code>docs</code>,
                    <code>chore</code>, etc.</li>
                <li><strong>Repo:</strong> <code>geral</code>, <code>backend</code>, <code>frontend</code>,
                    <code>database</code>.</li>
                <li><strong>Exemplo:</strong> <code>feat/backend-US-04-implementar-autenticacao</code></li>
            </ul>
        </blockquote>
    </li>
    <li>
        <h4><strong>Passo 2: Desenvolvendo com Qualidade</strong></h4>
        <p>Ao implementar sua funcionalidade ou correção, é <strong>obrigatório</strong> que você também crie/atualize:
        </p>
        <ul>
            <li>✅ Testes Unitários e End-to-End (E2E).</li>
            <li>✅ Documentação relevante (código, READMEs, Swagger, etc.).</li>
        </ul>
    </li>
    <li>
        <h4><strong>Passo 3: Sincronização e Validação no CI Local</strong></h4>
        <p>Antes de abrir uma Pull Request, garanta que seu código funciona integrado com o trabalho mais recente da
            equipe.</p>
        <ul>
            <li>
                <strong>Sincronize com a <code>main</code>:</strong>
                <pre><code>git pull origin main</code></pre>
            </li>
            <li>
                <strong>Valide no Ambiente de CI:</strong>
                <pre><code>podman-compose up --build --no-cache</code></pre>
            </li>
        </ul>
    </li>
    <li>
        <h4><strong>Passo 4: Pull Request (PR) e Code Review</strong></h4>
        <p>Com todos os passos anteriores concluídos com sucesso, é hora de integrar o seu trabalho.</p>
        <ul>
            <li>Abra uma <strong>Pull Request</strong> da sua branch para a <code>main</code>.</li>
            <li>Na descrição, explique de forma clara as alterações realizadas.</li>
            <li>Sua PR será revisada com base no nosso <strong>"Definition of Done"</strong>.</li>
        </ul>
    </li>
</ol>

<hr>

<h2>Padrões Específicos por Repositório</h2>
<p>
    Além das diretrizes gerais, cada parte da aplicação possui convenções específicas. Antes de contribuir, consulte a
    documentação correspondente:
</p>
<ul>
    <li>📄 <strong><a href="./checklist-8-18-back/README.md">Guia de Contribuição do Backend</a></strong></li>
    <li>📄 <strong><a href="./checklist-8-18-front/README.md">Guia de Contribuição do Frontend</a></strong></li>
    <li>📄 <strong><a href="./checklist-8-18-bd/README.md">Guia de Contribuição do Banco de Dados</a></strong></li>
</ul>