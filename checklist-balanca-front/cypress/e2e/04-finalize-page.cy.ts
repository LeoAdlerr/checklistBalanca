describe('Tela 4: Revisar e Finalizar Inspeção', () => {

  beforeEach(() => {
    cy.intercept('GET', '**/lookups/*', { body: [] }).as('getLookups');
    cy.intercept('GET', '**/inspections/123', { fixture: 'inspection-finalize-data.json' }).as('getInspection');
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach((viewport) => {
    context(`Funcionalidades em ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
        cy.visit('/inspections/123/finalize');
        cy.wait('@getInspection');
      });

      it('deve carregar a página e exibir os dados em modo somente leitura', () => {
        cy.get('[data-testid="finalize-card"]').contains('Revisão Final').should('be.visible');
        cy.get('[data-testid="inspector-name-input"]').find('input').should('have.attr', 'readonly');
      });

      it('deve permitir a edição, salvar os dados e bloquear o formulário novamente', () => {
        cy.intercept('PATCH', '**/inspections/123', { statusCode: 200, body: {} }).as('updateInspection');
        cy.get('[data-testid="edit-btn"]').click();
        cy.get('[data-testid="inspector-name-input"]').find('input').clear().type('Nome Alterado no E2E');
        cy.get('[data-testid="save-btn"]').click();
        cy.wait('@updateInspection');
        cy.get('[data-testid="edit-btn"]').should('be.visible');
      });

      it('deve finalizar a inspeção e redirecionar para a página de relatório real', () => {
        // 1. Mock da chamada de finalização (PATCH)
        cy.intercept('PATCH', '**/inspections/123/finalize', { statusCode: 200, body: {} }).as('finalizeInspection');
        
        // 2. Preparamos os mocks que a *nova página (Tela 5)* vai chamar APÓS o redirecionamento
        cy.intercept('GET', '**/inspections/123', { fixture: 'inspection-report-data.json' }).as('getReportData');
        cy.intercept('GET', '**/inspections/123/report/html', { fixture: 'report.html' }).as('getReportHtml');
        
        // 3. Ação do usuário: Clica em finalizar
        cy.get('[data-testid="submit-finalize-btn"]').should('not.be.disabled').click();
        
        // 4. Espera a ação de finalizar ser completada
        cy.wait('@finalizeInspection');

        // 5. Agora, esperamos as chamadas que a nova página faz para carregar
        cy.wait(['@getReportData', '@getReportHtml']);

        // 6. Verificamos se a URL mudou para a página de relatório.
        cy.url().should('include', '/inspections/123/report');

        // 7. Verificamos se um elemento REAL da Tela 5 está visível, em vez do elemento "dublê".
        cy.get('[data-testid="report-card"]').should('be.visible');
        cy.get('[data-testid="inspector-name"]').should('contain.text', 'Inspetor Final E2E');
      });

      it('deve exibir uma mensagem de erro se a finalização falhar', () => {
        cy.intercept('PATCH', '**/inspections/123/finalize', {
          statusCode: 400,
          body: { message: ['Checklist incompleto'] }
        }).as('finalizeFail');
        
        cy.on('window:alert', (text) => {
          expect(text).to.contains('Checklist incompleto');
        });

        cy.get('[data-testid="submit-finalize-btn"]').click();
        cy.wait('@finalizeFail');
      });
    });
  });
});