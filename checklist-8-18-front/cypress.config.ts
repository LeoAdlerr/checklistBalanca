import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Certifique-se que a porta está correta
    setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions,
    ) {
      // implement node event listeners here
      // Esta é uma boa prática para ignorar o erro "ResizeObserver" que você viu nos logs de teste.
      // Embora não seja um erro de build, já resolve um problema futuro.
      on('uncaught:exception', (err) => {
        if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
          return false
        }
        return true
      })
      return config
    },
  },
})
