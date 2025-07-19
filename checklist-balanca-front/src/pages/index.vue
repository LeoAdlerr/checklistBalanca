<template>
  <v-container>
    <v-responsive class="text-center">
      <h1 class="text-h4 font-weight-bold my-8">Bem-vindo, Inspetor</h1>

      <v-btn color="yellow-darken-2" size="x-large" prepend-icon="mdi-plus-circle-outline" @click="startNewInspection"
        class="mb-10">
        Iniciar Novo Checklist 8/18
      </v-btn>

      <h2 class="text-h5 font-weight-bold mb-3">Inspeções Salvas</h2>
      <v-card flat rounded="lg">
        <v-data-table :headers="tableHeaders" :items="inspections" :loading="isLoading"
          loading-text="Buscando inspeções..." no-data-text="Nenhuma inspeção encontrada">
          <template v-slot:item.actions="{ item }">
            <v-btn small variant="tonal" class="mr-2" :data-testid="`continue-btn-${item.id}`"
              @click="editInspection(item.id)">
              Continuar
            </v-btn>
            <v-btn small variant="tonal" color="info" @click="viewInspection(item.id)">
              Visualizar
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
// ✅ O script fica mais simples, sem ref e watch
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';

const router = useRouter();
const inspectionsStore = useInspectionsStore();
const { inspections, isLoading } = storeToRefs(inspectionsStore);

const tableHeaders = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Data de Início', key: 'createdAt', align: 'start' },
  { title: 'Status', key: 'status.name', align: 'start' },
  { title: 'Inspetor', key: 'inspectorName', align: 'start' },
  { title: 'Motorista', key: 'driverName', align: 'start' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'center' },
] as const;

const startNewInspection = () => {
  router.push('/inspections/new');
};

const editInspection = (id: number) => {
  router.push(`/inspections/${id}`);
};

const viewInspection = (id: number) => {
  alert(`Visualizar inspeção ID: ${id}`);
};

onMounted(() => {
  inspectionsStore.fetchInspections();
});
</script>