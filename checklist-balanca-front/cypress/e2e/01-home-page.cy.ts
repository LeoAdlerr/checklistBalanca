describe('Tela 1: Página Inicial', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
  });

  context('Visualização em Desktop', () => {
    beforeEach(() => {
      cy.viewport(1280, 720);
      cy.visit('/');
    });

    it('deve exibir a tabela de inspeções e os elementos principais', () => {
      // Esta asserção assume a responsabilidade de esperar.
      // O Cypress tentará encontrar este elemento por até 4 segundos (padrão),
      // o que é tempo suficiente para a API responder e a tabela ser renderizada.
      cy.get('[data-testid="inspections-data-table"]').should('be.visible');

      // O resto das asserções continua igual
      cy.contains('h1', 'Bem-vindo, Inspetor').should('be.visible');
      cy.contains('button', /Iniciar Novo Checklist/i).should('be.visible');
      cy.get('.v-card.mb-4').should('not.exist');
      cy.contains('td', 'Leonardo').should('be.visible');
    });

    it('deve navegar corretamente ao clicar nos botões', () => {
      // garantimos que a página carregou antes de clicar
      cy.get('[data-testid="continue-btn-1"]').should('be.visible').click();
      cy.url().should('include', '/inspections/1');

      cy.visit('/');
      cy.contains('button', /Iniciar Novo Checklist/i).should('be.visible').click();
      cy.url().should('include', '/inspections/new');
    });
  });

  context('Visualização em Smartphone', () => {
    beforeEach(() => {
      cy.viewport('iphone-xr');
      cy.visit('/');
    });

    it('deve exibir os cartões de inspeção e os elementos principais', () => {
      // a asserção de espera é nos cartões
      cy.contains('.v-card-title', 'Checklist #1').should('be.visible');

      cy.contains('h1', 'Bem-vindo, Inspetor').should('be.visible');
      cy.contains('button', /Iniciar Novo Checklist/i).should('be.visible');
      cy.get('.v-card.mb-4').should('be.visible');
      cy.get('[data-testid="inspections-data-table"]').should('not.exist');
      cy.contains('.v-card-text', 'Inspetor: Leonardo').should('be.visible');
    });

    it('deve navegar corretamente ao clicar nos botões', () => {
      cy.get('[data-testid="continue-btn-1"]').should('be.visible').click();
      cy.url().should('include', '/inspections/1');
      
      cy.visit('/');
      cy.contains('button', /Iniciar Novo Checklist/i).should('be.visible').click();
      cy.url().should('include', '/inspections/new');
    });
  });
});