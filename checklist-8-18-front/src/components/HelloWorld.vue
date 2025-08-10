<template>
  <v-app>
    <v-main>
      <v-container>
        <v-card
          title="Setup do Frontend Concluído!"
          subtitle="Vuetify está instalado e funcionando."
          variant="tonal"
        >
          <v-card-text>
            <p>O projeto Vue.js foi criado com sucesso, e este card é a prova de que a biblioteca de componentes Vuetify está pronta para ser utilizada.</p>
            <p><strong>Próximo passo:</strong> Começar a desenvolver as telas do nosso MVP.</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="elevated">Botão de Teste</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  const links = [
    {
      href: 'https://vuetifyjs.com/',
      icon: 'mdi-text-box-outline',
      subtitle: 'Learn about all things Vuetify in our documentation.',
      title: 'Documentation',
    },
    {
      href: 'https://vuetifyjs.com/introduction/why-vuetify/#feature-guides',
      icon: 'mdi-star-circle-outline',
      subtitle: 'Explore available framework Features.',
      title: 'Features',
    },
    {
      href: 'https://vuetifyjs.com/components/all',
      icon: 'mdi-widgets-outline',
      subtitle: 'Discover components in the API Explorer.',
      title: 'Components',
    },
    {
      href: 'https://discord.vuetifyjs.com',
      icon: 'mdi-account-group-outline',
      subtitle: 'Connect with Vuetify developers.',
      title: 'Community',
    },
  ]
</script>
