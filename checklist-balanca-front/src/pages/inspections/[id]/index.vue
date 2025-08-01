<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon data-testid="nav-drawer-btn" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>Inspeção de Cargas</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :permanent="!mobile" :temporary="mobile" width="300">
      <v-list-item title="Pontos de Inspeção" :subtitle="`Checklist #${currentInspection?.id}`"></v-list-item>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in currentInspection?.items"
          :key="item.id"
          :title="`${item.masterPoint.pointNumber}. ${item.masterPoint.name}`"
          :value="item.masterPointId"
          :active="selectedPoint?.id === item.id"
          @click="handlePointSelection(item)"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-overlay :model-value="isSaving || isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">Aguarde...</div>
      </v-overlay>

      <v-container v-if="!isLoading && selectedPoint">
        <v-card
          data-testid="checklist-point-card"
          :title="`${selectedPoint.masterPoint.pointNumber}. ${selectedPoint.masterPoint.name}`"
          :subtitle="selectedPoint.masterPoint.description"
        >
          <v-card-text>
            <div class="mb-2 text-subtitle-1 font-weight-bold">Status</div>
            <v-btn-toggle
              :model-value="selectedPoint.statusId"
              color="primary"
              group
              mandatory
              @update:model-value="requestStatusChange"
            >
              <v-btn data-testid="status-btn-ok" :value="2">Conforme</v-btn>
              <v-btn data-testid="status-btn-not-ok" :value="3">Não Conforme</v-btn>
              <v-btn data-testid="status-btn-na" :value="4">N/A</v-btn>
            </v-btn-toggle>

            <div class="mt-6 mb-2 text-subtitle-1 font-weight-bold">Observações</div>
            <v-textarea
              v-model="selectedPoint.observations"
              variant="outlined"
              rows="3"
              auto-grow
              :disabled="isPendente"
              placeholder="Selecione um status para habilitar."
            ></v-textarea>

            <div class="d-flex align-center justify-space-between mt-4 mb-2">
              <div class="text-subtitle-1 font-weight-bold">Evidências</div>
              <v-btn
                v-if="selectedPoint.evidences && selectedPoint.evidences.length > 0"
                color="blue"
                variant="tonal"
                size="small"
                @click="isEvidenceManagerOpen = true"
              >
                Gerir Evidências ({{ selectedPoint.evidences.length }})
              </v-btn>
            </div>
            <v-file-input
              v-model="stagedFile"
              label="Anexar nova imagem (opcional)"
              variant="outlined"
              prepend-icon="mdi-camera"
              accept="image/*"
              :disabled="isPendente"
              placeholder="Selecione um status para habilitar."
            ></v-file-input>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn size="large" color="success" prepend-icon="mdi-content-save" @click.prevent="saveCurrentPoint">
              Salvar Alterações
            </v-btn>
            <v-spacer></v-spacer>

            <v-tooltip location="top" text="Preencha o status de todos os 18 pontos para poder avançar.">
              <template v-slot:activator="{ props }">
                <div v-bind="props">
                  <v-btn
                    size="large"
                    color="blue"
                    append-icon="mdi-arrow-right-circle-outline"
                    :disabled="!isChecklistComplete"
                    @click="proceedToFinalization"
                  >
                    Revisar e Finalizar
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <v-dialog v-model="isStatusConfirmOpen" max-width="400" persistent>
      <v-card
        title="Confirmar Alteração"
        text="Tem a certeza de que deseja alterar o status deste item? A alteração será salva imediatamente."
      >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isStatusConfirmOpen = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmStatusChange">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isEvidenceManagerOpen" max-width="800" scrollable>
      <v-card :title="`Evidências - Ponto ${selectedPoint?.masterPoint.pointNumber}`">
        <v-card-text>
          <p v-if="!selectedPoint?.evidences || selectedPoint.evidences.length === 0" class="text-center text-grey">
            Nenhuma evidência enviada.
          </p>
          <v-row v-else>
            <v-col v-for="evidence in selectedPoint.evidences" :key="evidence.id" cols="6" sm="4" md="3">
              <v-card class="d-inline-block" elevation="2">
                <v-img
                  :src="`${apiBaseUrl}/${evidence.filePath}`"
                  :alt="evidence.fileName"
                  height="120"
                  cover
                  class="image-thumbnail"
                  @click="viewEvidence(evidence)"
                ></v-img>
                <v-card-actions class="pa-1 justify-center">
                  <v-btn
                    icon="mdi-download"
                    size="x-small"
                    variant="text"
                    :href="`${apiBaseUrl}/${evidence.filePath}`"
                    target="_blank"
                    title="Baixar Imagem"
                  ></v-btn>
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    color="error"
                    variant="text"
                    title="Apagar Imagem"
                    @click="confirmDelete(evidence)"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="isEvidenceManagerOpen = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isImageViewerOpen" max-width="90vw">
      <v-card>
        <v-img :src="viewingEvidenceUrl"></v-img>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isDeleteConfirmOpen" max-width="400" persistent>
      <v-card title="Confirmar Exclusão" text="Tem a certeza de que deseja apagar esta evidência?">
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isDeleteConfirmOpen = false">Cancelar</v-btn>
          <v-btn color="error" @click="executeDelete">Apagar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { InspectionChecklistItem, ItemEvidence } from '@/models';
import { useDisplay } from 'vuetify';

// O script permanece o mesmo da versão anterior. Nenhuma correção foi necessária aqui.
const { mobile } = useDisplay();
const drawer = ref(!mobile.value);
const route = useRoute();
const router = useRouter();
const inspectionsStore = useInspectionsStore();
const { currentInspection, isLoading, isSubmitting } = storeToRefs(inspectionsStore);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const selectedPoint = ref<InspectionChecklistItem | null>(null);
const isSaving = ref(false);
const stagedFile = ref<File | null>(null);

const isPendente = computed(() => !selectedPoint.value || selectedPoint.value.statusId === 1);

const isStatusConfirmOpen = ref(false);
const pendingStatusId = ref<number | null>(null);

function requestStatusChange(newStatusId: number | undefined) {
  if (newStatusId === undefined || newStatusId === selectedPoint.value?.statusId) return;
  pendingStatusId.value = newStatusId;
  isStatusConfirmOpen.value = true;
}

async function confirmStatusChange() {
  if (selectedPoint.value && pendingStatusId.value) {
    selectedPoint.value.statusId = pendingStatusId.value;
    await saveCurrentPoint();
  }
  isStatusConfirmOpen.value = false;
  pendingStatusId.value = null;
}

const isEvidenceManagerOpen = ref(false);
const isImageViewerOpen = ref(false);
const viewingEvidence = ref<ItemEvidence | null>(null);
const viewingEvidenceUrl = computed(() =>
  viewingEvidence.value ? `${apiBaseUrl}/${viewingEvidence.value.filePath}` : ''
);

const isDeleteConfirmOpen = ref(false);
const evidenceToDelete = ref<ItemEvidence | null>(null);

function viewEvidence(evidence: ItemEvidence) {
  viewingEvidence.value = evidence;
  isImageViewerOpen.value = true;
}

function confirmDelete(evidence: ItemEvidence) {
  evidenceToDelete.value = evidence;
  isDeleteConfirmOpen.value = true;
}

async function executeDelete() {
  if (evidenceToDelete.value && selectedPoint.value) {
    await inspectionsStore.deleteEvidence(selectedPoint.value, evidenceToDelete.value);
  }
  isDeleteConfirmOpen.value = false;
  evidenceToDelete.value = null;
  if (selectedPoint.value?.evidences.length === 0) {
    isEvidenceManagerOpen.value = false;
  }
}

const saveCurrentPoint = async (e?: Event) => {
  e?.preventDefault();

  if (!selectedPoint.value) {
    console.error('No point selected');
    return;
  }

  if (isPendente.value) {
    if (!stagedFile.value && !selectedPoint.value.observations) {
      console.log('No changes to save');
      return;
    }
    alert('Por favor, selecione um Status (Conforme, Não Conforme ou N/A) antes de salvar.');
    return;
  }

  isSaving.value = true;
  const fileToUpload = stagedFile.value;

  try {
    await inspectionsStore.updateChecklistItem(selectedPoint.value.masterPointId, {
      statusId: selectedPoint.value.statusId,
      observations: selectedPoint.value.observations || '',
    });

    if (fileToUpload) {
      await inspectionsStore.uploadEvidence(selectedPoint.value.masterPointId, fileToUpload);
      stagedFile.value = null;
    }
  } catch (error) {
    console.error('Error in save operation:', error);
    alert(`Erro ao salvar: ${(error as Error).message}`);
  } finally {
    isSaving.value = false;
  }
};

const handlePointSelection = (item: InspectionChecklistItem) => {
  if (selectedPoint.value?.id === item.id) return;
  selectedPoint.value = item;
  if (mobile.value) {
    drawer.value = false;
  }
};

const isChecklistComplete = computed(() => {
  if (!currentInspection.value) return false;
  // Status 1 é 'PENDENTE'. A condição está correta.
  return currentInspection.value.items.every((item) => item.statusId !== 1);
});

function proceedToFinalization() {
  if (!isChecklistComplete.value || !currentInspection.value) return;
  router.push(`/inspections/${currentInspection.value.id}/finalize`);
}

watch(
  selectedPoint,
  () => {
    stagedFile.value = null;
  },
  { deep: false }
);

watch(
  currentInspection,
  (newVal) => {
    if (newVal && newVal.items?.length > 0 && !selectedPoint.value) {
      selectedPoint.value = newVal.items[0];
    }
  },
  { immediate: true }
);

onMounted(() => {
  const inspectionId = Number(route.params.id);
  inspectionsStore.fetchInspectionById(inspectionId);
  if (window.Cypress) {
    console.log('[Componente Vue]: Expondo funções e estado para o Cypress...');
    window.Cypress.vue = {
      requestStatusChange,
      confirmStatusChange,
      getState: () => ({
        selectedPoint: selectedPoint.value,
        isStatusConfirmOpen: isStatusConfirmOpen.value,
        pendingStatusId: pendingStatusId.value,
      }),
    };
  }
});
</script>

<style scoped>
.image-thumbnail {
  cursor: pointer;
}
</style>