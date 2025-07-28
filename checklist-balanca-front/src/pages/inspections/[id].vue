<template>
  <v-layout>
    <v-navigation-drawer permanent width="300">
      <v-list-item title="Pontos de Inspeção" :subtitle="`Checklist #${currentInspection?.id}`"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item v-for="item in currentInspection?.items" :key="item.id"
          :title="`${item.masterPoint.pointNumber}. ${item.masterPoint.name}`" :value="item.masterPointId"
          :active="selectedPoint?.id === item.id" :data-testid="`item-${item.masterPointId}`"
          @click="handlePointSelection(item)"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-overlay :model-value="isSaving || isLoading" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="text-center mt-4">Salvando...</div>
      </v-overlay>

      <v-container v-if="!isLoading && selectedPoint">
        <v-card :title="`${selectedPoint.masterPoint.pointNumber}. ${selectedPoint.masterPoint.name}`"
          :subtitle="selectedPoint.masterPoint.description">
          <v-card-text>
            <div class="text-subtitle-1 font-weight-bold mb-2">Status</div>
            <v-btn-toggle v-model="selectedPoint.statusId" @update:model-value="updateStatus" color="primary" group
              mandatory>
              <v-btn :value="2" data-testid="status-btn-2">Conforme</v-btn>
              <v-btn :value="3" data-testid="status-btn-3">Não Conforme</v-btn>
              <v-btn :value="4" data-testid="status-btn-4">N/A</v-btn>
            </v-btn-toggle>

            <div class="text-subtitle-1 font-weight-bold mt-6 mb-2">Observações</div>
            <v-textarea v-model="selectedPoint.observations" variant="outlined" rows="3" auto-grow></v-textarea>

            <div class="text-subtitle-1 font-weight-bold mt-4 mb-2">Evidências</div>
            
            <v-file-input
              v-model="stagedFile"
              label="Anexar imagem (opcional)"
              variant="outlined"
              prepend-icon="mdi-camera"
              accept="image/*"
              :disabled="isLoading || isSaving"
              hide-details
              density="compact"
              clearable
            ></v-file-input>

          </v-card-text>
          <v-card-actions>
            <v-btn size="large" color="success" prepend-icon="mdi-content-save" @click="saveCurrentPoint">
              Salvar Alterações
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn size="large" color="blue" append-icon="mdi-arrow-right-circle-outline">
              Prosseguir para Finalização
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
      <v-container v-else class="d-flex justify-center align-center fill-height">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router/auto';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { InspectionChecklistItem } from '@/models';

const route = useRoute();
const inspectionsStore = useInspectionsStore();
const { currentInspection, isLoading } = storeToRefs(inspectionsStore);

const selectedPoint = ref<InspectionChecklistItem | null>(null);
const isSaving = ref(false);

const stagedFile = ref<File[]>([]);

/**
 * Função centralizada para salvar. Chamada apenas por ações explícitas do utilizador.
 */
const saveCurrentPoint = async () => {
  if (!selectedPoint.value) return;

  const validStatusIds = [2, 3, 4];
  if (!validStatusIds.includes(selectedPoint.value.statusId)) {
    // Adiciona um alerta para o utilizador saber por que não está a salvar.
    alert('Por favor, selecione um Status (Conforme, Não Conforme ou N/A) antes de salvar.');
    return;
  }

  isSaving.value = true;
  const fileToUpload = stagedFile.value[0];

  try {
    await inspectionsStore.updateChecklistItem(selectedPoint.value.masterPointId, {
      statusId: selectedPoint.value.statusId,
      observations: selectedPoint.value.observations,
    });

    if (fileToUpload) {
      await inspectionsStore.uploadEvidence(selectedPoint.value.masterPointId, fileToUpload);
    }
    
    stagedFile.value = [];
  } catch (error) {
    console.error("Falha ao salvar o ponto ou enviar a evidência:", error);
  } finally {
    isSaving.value = false;
  }
};

/**
 * A função agora APENAS navega. Não salva mais automaticamente.
 */
const handlePointSelection = (item: InspectionChecklistItem) => {
  if (selectedPoint.value?.id === item.id) return;

  // A troca de ponto é uma ação "destrutiva" para rascunhos não salvos.
  selectedPoint.value = item;
};

const updateStatus = (newStatusId: number) => {
  if (!selectedPoint.value || !newStatusId) return;
  selectedPoint.value.statusId = newStatusId;
  saveCurrentPoint();
};

/**
 * Este watcher é o responsável por limpar o rascunho.
 * Sempre que um novo ponto é selecionado, o ficheiro que estava preparado é descartado.
 */
watch(selectedPoint, () => {
  stagedFile.value = []; 
}, { deep: false });


// Watch inicial para selecionar o primeiro ponto
watch(currentInspection, (newVal) => {
  if (newVal && newVal.items?.length > 0 && !selectedPoint.value) {
    selectedPoint.value = newVal.items[0];
  }
}, { immediate: true });

onMounted(() => {
  const inspectionId = Number(route.params.id);
  inspectionsStore.fetchInspectionById(inspectionId);
});

</script>