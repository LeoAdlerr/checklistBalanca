describe('Fluxo de Criação de Inspeção (E2E)', () => {
  beforeEach(() => {
    // Interceptamos as chamadas à API para controlar os dados do teste
    cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
    
    // Removemos a subpasta 'lookups/' do caminho do fixture
    cy.intercept('GET', '**/lookups/*', (req) => {
      if (req.url.includes('modalities')) {
        req.reply({ fixture: 'modalities.json' });
      } else if (req.url.includes('operation-types')) {
        req.reply({ fixture: 'operation-types.json' });
      } else if (req.url.includes('unit-types')) {
        req.reply({ fixture: 'unit-types.json' });
      } else {
        // Fallback para outros lookups que possam ser chamados
        req.reply({ fixture: 'lookups.json' });
      }
    }).as('getLookups');

    cy.intercept('POST', '**/inspections', { statusCode: 201, body: { id: 999 } }).as('createInspection');
    cy.intercept('POST', '**/inspections/check-existing', { statusCode: 404, body: {} }).as('checkExisting');

    cy.visit('/');
  });

  it('deve permitir que o usuário crie uma nova inspeção', () => {
    // 1. TELA INICIAL
    cy.wait('@getInspections');
    cy.contains('h1', 'Bem-vindo, Inspetor').should('be.visible');

    // 2. NAVEGAÇÃO
    cy.contains('button', 'Iniciar Novo Checklist').click();
    cy.url().should('include', '/inspections/new');
    
    // 3. PREENCHIMENTO DO FORMULÁRIO
    cy.wait('@getLookups');
    cy.get('[data-testid="inspector-name-input"]').type('Inspetor Cypress');
    cy.get('[data-testid="driver-name-input"]').type('Motorista Cypress');
    cy.get('[data-testid="modality-select"]').click();
    cy.contains('.v-list-item-title', 'RODOVIARIO').click();
    cy.get('[data-testid="operation-type-select"]').click();
    cy.contains('.v-list-item-title', 'VERDE').click();
    cy.get('[data-testid="unit-type-select"]').click();
    cy.contains('.v-list-item-title', 'CONTAINER').click();
    
    // 4. SUBMISSÃO
    cy.get('[data-testid="submit-btn"]').click();

    // 5. VERIFICAÇÃO
    cy.wait('@checkExisting');
    cy.wait('@createInspection');
    cy.url().should('include', '/inspections/999');
  });
});