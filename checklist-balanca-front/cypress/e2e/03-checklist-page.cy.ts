describe('Tela 3: Página do Checklist', () => {
  beforeEach(() => {
    cy.log('Configurando interceptors de API');

    // Agora o intercept só "ouve" requisições com o nosso selo secreto.
    cy.intercept(
      { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
      { fixture: 'inspection-detail.json' }
    ).as('getInspectionDetail');

    cy.intercept('PATCH', '**/inspections/123/points/*', {
      statusCode: 200,
      body: { success: true },
    }).as('updateItem');

    cy.intercept('POST', '**/inspections/123/points/*/evidence', {
      statusCode: 201,
      body: { id: 1, fileName: 'test-image.png' },
    }).as('uploadEvidence');
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach(viewport => {
    context(`Funcionalidades em ${viewport}`, () => {
      beforeEach(() => {
        cy.createAndGoToChecklist();
        cy.wait('@getInspectionDetail');
      });

      // Os testes que já estavam passando, permanecem intactos.
      it('deve carregar o primeiro ponto com os campos desabilitados', () => {
        cy.contains('.v-card-title', '1. CABINE').should('be.visible');
        cy.get('textarea').should('be.disabled');
        cy.get('input[type="file"]').should('be.disabled');
      });

      it('deve permitir preencher um ponto (status, observação e evidência)', () => {
        cy.contains('.v-card-title', '1. CABINE', { timeout: 10000 }).should('be.visible');
        cy.window().its('Cypress.vue').invoke('requestStatusChange', 3);
        cy.window().its('Cypress.vue').invoke('confirmStatusChange');
        cy.wait('@updateItem');
        cy.get('[data-testid="checklist-point-card"]').find('textarea').filter(':visible').should('be.enabled').type('Retrovisor trincado.');
        cy.get('[data-testid="checklist-point-card"]').find('input[type="file"]').should('be.enabled').selectFile('cypress/fixtures/test-image.png', { force: true });
        cy.contains('button', 'Salvar Alterações').click();
        cy.wait(['@updateItem', '@uploadEvidence']);
        cy.contains('Gerir Evidências (1)').should('be.visible');
      });

      it('deve permitir a navegação entre os pontos', () => {
        if (viewport === 'iphone-xr') {
          cy.get('[data-testid="nav-drawer-btn"]').click();
        }
        
        cy.get('.v-navigation-drawer')
          .contains('.v-list-item', '2. PNEUS')
          .click({ force: true });
        
        cy.contains('.v-card-title', '2. PNEUS').should('be.visible');
      });

      // Verifica o botão desabilitado.
      it('deve manter o botão "Revisar e Finalizar" desabilitado se o checklist estiver incompleto', () => {
        cy.contains('button', 'Revisar e Finalizar')
          .should('be.visible')
          .and('be.disabled');
      });

      it('deve navegar para a tela de revisão se o checklist estiver completo', () => {
        // O intercept para este teste também usa o selo secreto
        cy.intercept(
          { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
          { fixture: 'inspection-detail-approved.json' }
        ).as('getCompleteInspection');

        // Agora, o cy.visit NUNCA será interceptado, pois ele não tem o selo.
        cy.visit('/inspections/123');
        // E o cy.wait vai esperar apenas pela chamada fetch com o selo.
        cy.wait('@getCompleteInspection');

        cy.contains('button', 'Revisar e Finalizar')
          .should('be.visible')
          .and('be.enabled')
          .click();

        cy.url().should('include', '/inspections/123/finalize');
        cy.contains('.v-card-title', 'Revisão Final').should('be.visible');
      });
    });
  });
});