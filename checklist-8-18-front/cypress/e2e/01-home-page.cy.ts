describe('Tela 1: Página Inicial', () => {

  beforeEach(() => {
    cy.intercept('DELETE', '**/inspections/2', { statusCode: 200, body: {} }).as('deleteInspection');
  });

  context('Navegação Principal', () => {
    it('deve navegar para a página de nova inspeção ao clicar em "Iniciar Novo Checklist"', () => {
      cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
      cy.visit('/');
      cy.wait('@getInspections', { timeout: 10000 });
      cy.contains('button', /Iniciar Novo Checklist/i).click();
      cy.url().should('include', '/inspections/new');
    });
  });

  context('Visualização em Desktop', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
      cy.viewport('macbook-15');
      cy.visit('/');
      cy.wait('@getInspections');
    });

    it('deve exibir o título correto e a tabela de inspeções', () => {
        cy.contains('h2', 'Inspeções Salvas').should('be.visible');
        cy.get('tbody tr').contains('td', 'EM_INSPECAO').should('be.visible');
    });
    it('deve navegar para a página do checklist ao clicar em "Continuar"', () => {
        cy.contains('tbody tr', 'EM_INSPECAO').within(() => cy.contains('button', 'Continuar').click());
        cy.url().should('include', '/inspections/2');
    });
    it('deve navegar para a página de revisão ao clicar em "Revisar"', () => {
        cy.contains('tbody tr', 'EM_INSPECAO').within(() => cy.contains('button', 'Revisar').click());
        cy.url().should('include', '/inspections/2/finalize');
    });

    it('deve apagar uma inspeção ao clicar em "Apagar" e confirmar', () => {
      cy.intercept(
        { method: 'GET', url: '**/inspections', times: 1 },
        { body: [{ "id": 1, "createdAt": "2025-08-06T14:10:04.000Z", "status": { "name": "APROVADO" }, "inspectorName": "E2E Inspector", "driverName": "E2E Driver" }] }
      ).as('getInspectionsAfterDelete');

      cy.contains('tbody tr', 'EM_INSPECAO').within(() => {
        cy.contains('button', 'Apagar').click();
      });

      cy.wait(['@deleteInspection', '@getInspectionsAfterDelete']);
      
      cy.get('.v-progress-circular').should('not.exist');
      cy.contains('td', 'EM_INSPECAO', { timeout: 10000 }).should('not.exist');
    });
  });

  context('Visualização em Smartphone', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
      cy.viewport('iphone-xr');
      cy.visit('/');
      cy.wait('@getInspections');
    });
    
    it('deve exibir o título correto e os cartões de inspeção', () => {
        cy.contains('h2', 'Inspeções Salvas').should('be.visible');
        cy.get('[data-testid="inspection-card-2"]').should('be.visible');
    });
    it('deve navegar corretamente ao clicar nos botões de ação do cartão', () => {
        cy.get('[data-testid="inspection-card-2"]').within(() => cy.contains('button', 'Continuar').click());
        cy.url().should('include', '/inspections/2');
        cy.go('back');
        cy.get('[data-testid="inspection-card-2"]').within(() => cy.contains('button', 'Revisar').click());
        cy.url().should('include', '/inspections/2/finalize');
    });

    it('deve apagar uma inspeção ao clicar no botão "Apagar" do cartão', () => {
      cy.intercept(
        { method: 'GET', url: '**/inspections', times: 1 },
        { body: [{ "id": 1, "createdAt": "2025-08-06T14:10:04.000Z", "status": { "name": "APROVADO" }, "inspectorName": "E2E Inspector", "driverName": "E2E Driver" }] }
      ).as('getInspectionsAfterDelete');

      cy.get('[data-testid="inspection-card-2"]').within(() => {
        cy.contains('button', 'Apagar').click();
      });
      
      cy.wait(['@deleteInspection', '@getInspectionsAfterDelete']);
      
      cy.get('.v-progress-circular').should('not.exist');
      cy.get('[data-testid="inspection-card-2"]', { timeout: 10000 }).should('not.exist');
    });
  });
});