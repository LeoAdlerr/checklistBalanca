/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('createAndGoToChecklist', () => {
  cy.log('--- COMANDO CUSTOMIZADO: Criando inspeção e navegando para o checklist ---');

  // Intercepta as chamadas necessárias para o fluxo de criação
  cy.intercept('GET', '**/inspections', { fixture: 'inspections.json' }).as('getInspections');
  cy.intercept('GET', '**/lookups/modalities', { fixture: 'modalities.json' }).as('getModalities');
  cy.intercept('GET', '**/lookups/operation-types', { fixture: 'operation-types.json' }).as('getOperationTypes');
  cy.intercept('GET', '**/lookups/unit-types', { fixture: 'unit-types.json' }).as('getUnitTypes');
  cy.intercept('POST', '**/inspections', { statusCode: 201, body: { id: 123 } }).as('createInspection');
  cy.intercept('POST', '**/inspections/check-existing', { statusCode: 404, body: {} }).as('checkExisting');

  // Executa a navegação e o preenchimento
  cy.visit('/');
  cy.wait('@getInspections');
  cy.contains('button', /Iniciar Novo Checklist/i).click();
  cy.get('[data-testid="inspector-name-input"]').type('Inspetor E2E');
  cy.get('[data-testid="driver-name-input"]').type('Motorista E2E');
  cy.get('[data-testid="modality-select"]').click();
  cy.get('.v-list-item').contains('RODOVIARIO').click();
  cy.get('[data-testid="operation-type-select"]').click();
  cy.get('.v-list-item').contains('VERDE').click();
  cy.get('[data-testid="unit-type-select"]').click();
  cy.get('.v-list-item').contains('CONTAINER').click();
  cy.get('[data-testid="submit-btn"]').click();
  cy.wait(['@checkExisting', '@createInspection']);
  cy.url().should('include', '/inspections/123');
});