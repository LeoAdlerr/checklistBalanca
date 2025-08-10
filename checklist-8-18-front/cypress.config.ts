const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Certifique-se que a porta está correta
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})