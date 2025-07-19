<template>
  <v-app>
    <v-app-bar color="blue-darken-4" density="compact">
      <template v-slot:prepend>
        <v-avatar>
          <v-img src="@/assets/coruja-logo.png" alt="Coruja UAGA T.I."></v-img>
        </v-avatar>
      </template>
      <v-app-bar-title class="font-weight-bold">
        Sistema de Inspeção de Cargas
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-slot:append>
        <v-avatar size="32">
          <v-img src="@/assets/universal-logo.png" alt="Universal Logotipo"></v-img>
        </v-avatar>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app class="d-flex flex-column pa-0">
      <div class="bg-blue-darken-4 text-center w-100 pa-2">
        <strong>Universal Armazéns Gerais e Alfandegados</strong>
      </div>
      <div class="px-4 py-2 bg-grey-darken-4 text-center w-100 text-caption">
        Desenvolvido por Leonardo Adler da Silva © {{ new Date().getFullYear() }} — 
        <strong>Versão {{ appVersion }} (alpha)</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
  import { version } from '@/../package.json';
  
  const appVersion = version;
</script>