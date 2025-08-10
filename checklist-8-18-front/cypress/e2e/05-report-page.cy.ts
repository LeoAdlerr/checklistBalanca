describe('Tela 5: Relatório da Inspeção', () => {

  beforeEach(() => {
    // Mock para os dados da inspeção (cabeçalho da página)
    cy.intercept('GET', '**/inspections/123', { fixture: 'inspection-report-data.json' }).as('getInspection');
    
    // Mock para o HTML do relatório (conteúdo do iframe)
    cy.intercept('GET', '**/inspections/123/report/html', { fixture: 'report.html' }).as('getReportHtml');
  });

  const viewports: Cypress.ViewportPreset[] = ['macbook-15', 'iphone-xr'];
  viewports.forEach((viewport) => {
    context(`Funcionalidades em ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
        cy.visit('/inspections/123/report');
        // Espera ambas as chamadas de API terminarem antes de continuar
        cy.wait(['@getInspection', '@getReportHtml']);
      });

      it('deve carregar e exibir os dados do cabeçalho e o relatório no iframe', () => {
        // Verifica os dados no cabeçalho
        cy.get('[data-testid="inspector-name"]').should('contain.text', 'Inspetor Final E2E');
        cy.get('[data-testid="driver-name"]').should('contain.text', 'Motorista Final E2E');
        cy.get('.v-chip').should('contain.text', 'Resultado: APROVADO');

        // Verifica o iframe
        cy.get('[data-testid="report-iframe"]').should('be.visible');
      });

      it('deve chamar a API de download de PDF ao clicar em "Baixar PDF"', () => {
        // Mock para a chamada de download do PDF
        cy.intercept('GET', '**/inspections/123/report/pdf', { body: 'fake-pdf-content' }).as('downloadPdf');

        cy.get('[data-testid="download-pdf-btn"]').click();

        // A melhor forma de testar o download é garantir que a chamada à API foi feita
        cy.wait('@downloadPdf');
      });

      it('deve navegar de volta para a tela anterior ao clicar no botão "Voltar"', () => {
        // Primeiro, vamos para a tela 4 para ter um "histórico" de navegação
        cy.visit('/inspections/123/finalize');
        cy.visit('/inspections/123/report');
        cy.wait(['@getInspection', '@getReportHtml']);

        // Clica no botão de voltar
        cy.get('[data-testid="back-btn"]').click();

        // Verifica se a URL mudou de volta para a tela de finalização
        cy.url().should('include', '/inspections/123/finalize');
      });
    });
  });
});