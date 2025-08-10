describe('Tela 3: Página do Checklist', () => {
  // Intercepts que são comuns a TODOS os testes nesta página
  beforeEach(() => {
    cy.log('Configurando interceptors de API comuns');
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
        // A primeira coisa que fazemos para cada teste é definir o viewport
        cy.viewport(viewport);
      });

      // Grupo 1: Testes para as funcionalidades básicas da página
      describe('Funcionalidades Básicas e Navegação', () => {
        beforeEach(() => {
          // Carrega a inspeção padrão (incompleta) antes de cada teste neste grupo
          cy.intercept(
            { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
            { fixture: 'inspection-detail.json' }
          ).as('getInspectionDetail');
          cy.visit('/inspections/123');
          cy.wait('@getInspectionDetail');
        });

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
          cy.get('.v-navigation-drawer').contains('.v-list-item', '2. PNEUS').click({ force: true });
          cy.contains('.v-card-title', '2. PNEUS').should('be.visible');
        });

        it('deve manter o botão "Revisar e Finalizar" desabilitado se o checklist estiver incompleto', () => {
          cy.contains('button', 'Revisar e Finalizar').should('be.visible').and('be.disabled');
        });
        
        it('deve navegar para a tela de revisão se o checklist estiver completo', () => {
          // Este teste precisa de um mock diferente, então o definimos aqui.
          cy.intercept(
            { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
            { fixture: 'inspection-detail-approved.json' }
          ).as('getCompleteInspection');
          cy.visit('/inspections/123');
          cy.wait('@getCompleteInspection');
          cy.contains('button', 'Revisar e Finalizar').should('be.visible').and('be.enabled').click();
          cy.url().should('include', '/inspections/123/finalize');
          cy.contains('.v-card-title', 'Revisão Final').should('be.visible');
        });
      });
      
      // Grupo 2: Testes específicos para o Modal de Evidências
      describe('Modal "Gerir Evidências"', () => {
        beforeEach(() => {
          // Carrega a inspeção que JÁ TEM uma evidência antes de cada teste neste grupo
          cy.intercept(
            { method: 'GET', url: '**/inspections/123', headers: { 'X-Cypress-Request': 'true' } },
            { fixture: 'inspection-detail-with-evidence.json' }
          ).as('getInspectionWithEvidence');

          cy.intercept('DELETE', '**/inspections/123/points/1/evidence', {
            statusCode: 200,
            fixture: 'inspection-detail-no-evidence.json'
          }).as('deleteEvidence');
          
          cy.intercept('GET', '**/inspections/123/points/1/evidence/test-image.png', {
            fixture: 'test-image.png'
          }).as('downloadEvidence');

          cy.visit('/inspections/123');
          cy.wait('@getInspectionWithEvidence');
        });

        it('deve abrir o modal, exibir, ampliar e fechar a visualização da evidência', () => {
          cy.contains('button', 'Gerir Evidências (1)').click();
          cy.get('.v-dialog').contains('Evidências').should('be.visible');
          cy.get('.image-thumbnail', { timeout: 10000 }).should('be.visible')
            .find('img').should('have.attr', 'src').and('include', 'cypress/fixtures/test-image.png');
          cy.get('.image-container').click();
          cy.get('.v-dialog:visible').find('img').should('have.attr', 'src').and('include', 'cypress/fixtures/test-image.png');
          cy.get('.v-dialog:visible').contains('button', 'Fechar').click();
          cy.get('.v-dialog').contains('Evidências').should('be.visible');
        });

        it('deve acionar o download da evidência', () => {
          cy.contains('button', 'Gerir Evidências (1)').click();
          cy.get('[data-testid="download-btn"]').click();
          cy.wait('@downloadEvidence').its('response.statusCode').should('eq', 200);
        });

        it('deve excluir a evidência, fechar o modal e atualizar a tela principal', () => {
          cy.contains('button', 'Gerir Evidências (1)').click();
          cy.get('[data-testid="delete-btn"]').click();
          cy.get('.v-dialog:visible').contains('.v-card-title', 'Confirmar Exclusão').should('be.visible');
          cy.get('.v-dialog:visible').contains('button', 'Excluir').click();
          cy.wait('@deleteEvidence');
          cy.contains('.v-dialog', 'Evidências').should('not.exist');
          cy.contains('button', 'Gerir Evidências').should('not.exist');
        });
      });
    });
  });
});