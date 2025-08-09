<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>Sistema de Inspeção</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-responsive class="text-center">
          <h1 class="my-8 text-h4 font-weight-bold">Bem-vindo, Inspetor</h1>

          <v-btn color="yellow-darken-2" size="x-large" prepend-icon="mdi-plus-circle-outline" class="mb-10"
            :block="mobile" @click="startNewInspection">
            Iniciar Novo Checklist 8/18
          </v-btn>

          <h2 class="mb-3 text-h5 font-weight-bold">Inspeções Salvas</h2>

          <v-card v-if="!mobile" flat rounded="lg">
            <v-data-table data-testid="inspections-data-table" :headers="tableHeaders" :items="inspections"
              :loading="isLoading" loading-text="Buscando inspeções..." no-data-text="Nenhuma inspeção encontrada">
              <template v-slot:item.actions="{ item }">
                <v-btn small variant="tonal" class="mr-2" :data-testid="`continue-btn-${item.id}`"
                  @click="editInspection(item.id)">
                  Continuar
                </v-btn>
                <v-btn small variant="tonal" color="info" class="mr-2" @click="goToReviewPage(item.id)">
                  Revisar
                </v-btn>
                <v-btn v-if="item.status.name === 'EM_INSPECAO'" small variant="tonal" color="error"
                  @click="confirmDelete(item)">
                  Apagar
                </v-btn>
              </template>
            </v-data-table>
          </v-card>

          <div v-else>
            <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
            <div v-if="!isLoading && inspections.length === 0">Nenhuma inspeção encontrada</div>

            <v-card v-for="item in inspections" :key="item.id" :data-testid="`inspection-card-${item.id}`"
              class="mb-4 text-left">
              <v-card-title>Checklist #{{ item.id }}</v-card-title>
              <v-card-subtitle>{{ formatDate(item.createdAt) }}</v-card-subtitle>
              <v-card-text>
                <div><strong>Inspetor:</strong> {{ item.inspectorName }}</div>
                <div><strong>Motorista:</strong> {{ item.driverName }}</div>
                <v-chip size="small" class="mt-2">{{ item.status.name }}</v-chip>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="item.status.name === 'EM_INSPECAO'" variant="tonal" color="error" size="small"
                  @click="confirmDelete(item)">
                  Apagar
                </v-btn>
                <v-btn variant="tonal" color="info" size="small" @click="goToReviewPage(item.id)">
                  Revisar
                </v-btn>
                <v-btn variant="tonal" size="small" color="primary" :data-testid="`continue-btn-${item.id}`"
                  @click="editInspection(item.id)">
                  Continuar
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-responsive>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import type { Inspection } from '@/models';

const { mobile } = useDisplay();
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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const startNewInspection = () => {
  router.push('/inspections/new');
};

const editInspection = (id: number) => {
  router.push(`/inspections/${id}`);
};

// leva para a Tela 4
const goToReviewPage = (id: number) => {
  router.push(`/inspections/${id}/finalize`);
};

/// função para confirmar e executar a exclusão
const confirmDelete = async (item: Inspection) => {
  const isConfirmed = confirm(`Tem a certeza de que deseja apagar a inspeção #${item.id} do inspetor ${item.inspectorName}? Esta ação não pode ser desfeita.`);

  if (isConfirmed) {
    try {
      // Deleta a inspeção
      await inspectionsStore.deleteInspection(item.id);
      
      await inspectionsStore.fetchInspections();

    } catch (error) {
      console.error('Erro ao apagar a inspeção:', error);
      alert(`Ocorreu um erro ao tentar apagar a inspeção.`);
    }
  }
};

onMounted(() => {
  inspectionsStore.fetchInspections();
});
</script>