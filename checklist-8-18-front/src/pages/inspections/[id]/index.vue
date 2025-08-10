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
        <v-list-item v-for="item in currentInspection?.items" :key="item.id"
          :title="`${item.masterPoint.pointNumber}. ${item.masterPoint.name}`" :value="item.masterPointId"
          :active="selectedPoint?.id === item.id" @click="handlePointSelection(item)"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-overlay :model-value="isSaving || isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">Aguarde...</div>
      </v-overlay>

      <v-container v-if="!isLoading && selectedPoint">
        <v-card data-testid="checklist-point-card"
          :title="`${selectedPoint.masterPoint.pointNumber}. ${selectedPoint.masterPoint.name}`"
          :subtitle="selectedPoint.masterPoint.description">
          <v-card-text>
            <div class="mb-2 text-subtitle-1 font-weight-bold">Status</div>
            <v-btn-toggle :model-value="activeStatus" color="primary" group @update:model-value="requestStatusChange">
              <v-btn data-testid="status-btn-ok" :value="2">Conforme</v-btn>
              <v-btn data-testid="status-btn-not-ok" :value="3">Não Conforme</v-btn>
              <v-btn data-testid="status-btn-na" :value="4">N/A</v-btn>
            </v-btn-toggle>

            <div class="mt-6 mb-2 text-subtitle-1 font-weight-bold">Observações</div>
            <v-textarea v-model="selectedPoint.observations" variant="outlined" rows="3" auto-grow
              :disabled="isPendente" placeholder="Selecione um status para habilitar."></v-textarea>

            <div class="d-flex align-center justify-space-between mt-4 mb-2">
              <div class="text-subtitle-1 font-weight-bold">Evidências</div>
              <v-btn v-if="selectedPoint.evidences && selectedPoint.evidences.length > 0" color="blue" variant="tonal"
                size="small" @click="isEvidenceManagerOpen = true">
                Gerir Evidências ({{ selectedPoint.evidences.length }})
              </v-btn>
            </div>

            <v-file-input v-model="stagedFile" label="Anexar nova imagem (opcional)" variant="outlined"
              prepend-icon="mdi-camera" accept="image/*" :disabled="isPendente"
              placeholder="Selecione um status para habilitar." :clearable="true"
              data-testid="file-input"></v-file-input>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn size="large" color="success" prepend-icon="mdi-content-save" @click.prevent="saveCurrentPoint">
              Salvar Alterações
            </v-btn>
            <v-spacer></v-spacer>
            <v-tooltip location="top" text="Preencha o status de todos os 18 pontos para poder avançar.">
              <template v-slot:activator="{ props }">
                <div v-bind="props">
                  <v-btn size="large" color="blue" append-icon="mdi-arrow-right-circle-outline"
                    :disabled="!isChecklistComplete" @click="proceedToFinalization">
                    Revisar e Finalizar
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>

    <!-- Modal Gerir Evidências - Com pré-visualização das imagens -->
    <v-dialog v-model="isEvidenceManagerOpen" max-width="800">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon left>mdi-image-multiple</v-icon>
          Evidências
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col v-for="ev in selectedPoint?.evidences" :key="ev.id" cols="12" sm="6" md="4"
              class="d-flex flex-column align-center">
              <!-- Container da pré-visualização com overlay indicativo -->
              <div class="image-container" @click="viewEvidence(ev)">
                <v-img :src="`${apiBaseUrl}/${ev.filePath}`" max-height="150" contain class="image-thumbnail mb-2">
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                    </v-row>
                  </template>

                  <!-- Overlay com ícone de zoom -->
                  <div class="image-overlay">
                    <v-icon color="white" size="32">mdi-magnify-plus-outline</v-icon>
                    <div class="text-caption white--text mt-1">Clique para ampliar</div>
                  </div>
                </v-img>
              </div>

              <div class="text-caption text-truncate font-weight-medium" style="max-width: 100%;">
                {{ ev.fileName || 'Evidência' }}
              </div>

              <div class="d-flex gap-2 mt-2">
                <v-btn color="primary" size="small" :loading="isDownloading" @click.stop="downloadEvidence(ev)"
                  data-testid="download-btn">
                  <v-icon left>mdi-download</v-icon>
                  Baixar
                </v-btn>
                <v-btn color="error" size="small" @click.stop="confirmDelete(ev)" data-testid="delete-btn">
                  <v-icon left>mdi-delete</v-icon>
                  Excluir
                </v-btn>
              </div>
            </v-col>
          </v-row>

          <div v-if="!selectedPoint?.evidences || selectedPoint.evidences.length === 0"
            class="text-center text-subtitle-1">
            Nenhuma evidência anexada.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="isEvidenceManagerOpen = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal Visualizador de Imagem Ampliada -->
    <v-dialog v-model="isImageViewerOpen" max-width="600" @click:outside="isImageViewerOpen = false">
      <v-card>
        <v-img :src="viewingEvidenceUrl" aspect-ratio="1.5" contain max-height="70vh">
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" :loading="isDownloading" @click="viewingEvidence && downloadEvidence(viewingEvidence)"
            v-if="viewingEvidence">
            <v-icon left>mdi-download</v-icon>
            Baixar
          </v-btn>
          <v-btn text @click="isImageViewerOpen = false">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmação de exclusão -->
    <v-dialog v-model="isDeleteConfirmOpen" max-width="400">
      <v-card>
        <v-card-title>Confirmar Exclusão</v-card-title>
        <v-card-text>Tem certeza que deseja excluir esta evidência?</v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="isDeleteConfirmOpen = false">Cancelar</v-btn>
          <v-spacer />
          <v-btn text color="error" @click="executeDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para confirmar mudança de status -->
    <v-dialog v-model="isStatusConfirmOpen" max-width="400">
      <v-card>
        <v-card-title>{{ modalTitle }}</v-card-title>
        <v-card-text>{{ modalText }}</v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="cancelStatusChange">Cancelar</v-btn>
          <v-spacer />
          <v-btn text color="primary" @click="confirmStatusChange">Confirmar</v-btn>
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

const { mobile } = useDisplay();
const drawer = ref(!mobile.value);
const route = useRoute();
const router = useRouter();
const inspectionsStore = useInspectionsStore();
const { currentInspection, isLoading, isSubmitting } = storeToRefs(inspectionsStore);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const selectedPoint = ref<InspectionChecklistItem | null>(null);
const isSaving = ref(false);
const isDownloading = ref(false);

// Adicionar refs para o modal de confirmação de status
const isStatusConfirmOpen = ref(false);
const pendingStatusChange = ref<number | null>(null);
const modalTitle = ref('');
const modalText = ref('');

// stagedFile aceita diferentes formatos que o v-file-input pode devolver (File | File[] | FileList | null)
const stagedFile = ref<File | File[] | FileList | null>(null);

const isPendente = computed(() => !selectedPoint.value || selectedPoint.value.statusId === 1);

const activeStatus = computed(() => {
  if (selectedPoint.value?.statusId === 1) return null;
  return selectedPoint.value?.statusId;
});

function requestStatusChange(newStatusId: number | undefined | null) {
  if (!selectedPoint.value || newStatusId == null || newStatusId === selectedPoint.value.statusId) return;

  // LÓGICA PARA DEFINIR O TEXTO DO MODAL
  if (newStatusId === 4) { // Se o status for "N/A"
    modalTitle.value = 'Atenção';
    modalText.value = 'Ao selecionar "N/A", este item ainda será considerado uma pendência e a inspeção não poderá ser finalizada.';
  } else { // Para qualquer outro status
    modalTitle.value = 'Confirmar Mudança de Status';
    modalText.value = 'Tem certeza que deseja alterar o status deste ponto?';
  }

  // Armazena o novo status pendente e abre o modal (comportamento original)
  pendingStatusChange.value = newStatusId;
  isStatusConfirmOpen.value = true;
}

// Nova função para confirmar a mudança de status
function confirmStatusChange() {
  if (!selectedPoint.value || pendingStatusChange.value === null) return;

  // Aplica a mudança de status
  selectedPoint.value.statusId = pendingStatusChange.value;
  isStatusConfirmOpen.value = false;
  pendingStatusChange.value = null;

  // Salva automaticamente
  saveCurrentPoint();
}

// Nova função para cancelar a mudança de status
function cancelStatusChange() {
  isStatusConfirmOpen.value = false;
  pendingStatusChange.value = null;
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

const downloadEvidence = async (evidence: ItemEvidence) => {
  if (!selectedPoint.value) return;

  isDownloading.value = true;
  try {
    await inspectionsStore.downloadEvidence(selectedPoint.value, evidence);
  } catch (error) {
    console.error('Erro ao baixar evidência:', error);
    alert('Não foi possível baixar a evidência');
  } finally {
    isDownloading.value = false;
  }
};

function confirmDelete(evidence: ItemEvidence) {
  evidenceToDelete.value = evidence;
  isDeleteConfirmOpen.value = true;
}

async function executeDelete() {
  if (evidenceToDelete.value && selectedPoint.value) {
    await inspectionsStore.deleteEvidence(selectedPoint.value, evidenceToDelete.value);

    // Fecha o modal se não houver mais evidências
    if (selectedPoint.value.evidences.length === 0) {
      isEvidenceManagerOpen.value = false;
    }
  }
  isDeleteConfirmOpen.value = false;
  evidenceToDelete.value = null;
}


function resolveStagedFile(input: any): File | null {
  if (!input) return null;
  if (input instanceof File) return input;
  if (typeof FileList !== 'undefined' && input instanceof FileList) return input[0] ?? null;
  if (Array.isArray(input)) {
    const file = input.find((f) => f instanceof File);
    if (file) return file;
    const maybe = input[0];
    if (maybe && maybe.name && maybe.size) {
      return null;
    }
    return null;
  }
  if (input && typeof input === 'object') {
    if (input.rawFile instanceof File) return input.rawFile;
    if (input.file instanceof File) return input.file;
    return null;
  }
  return null;
}

const saveCurrentPoint = async (e?: Event) => {
  e?.preventDefault();
  if (!selectedPoint.value) return;

  const fileToUpload = resolveStagedFile(stagedFile.value);

  if (isPendente.value) {
    if (!fileToUpload && !selectedPoint.value.observations) {
      alert('Por favor, selecione um Status (Conforme, Não Conforme ou N/A) ou adicione uma observação/evidência para salvar.');
      return;
    }
  }

  isSaving.value = true;
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
  stagedFile.value = null;
  if (mobile.value) {
    drawer.value = false;
  }
};

const isChecklistComplete = computed(() => {
  if (!currentInspection.value) return false;
  return currentInspection.value.items.every((item) => item.statusId !== 1);
});

function proceedToFinalization() {
  if (!isChecklistComplete.value || !currentInspection.value) return;
  router.push(`/inspections/${currentInspection.value.id}/finalize`);
}

watch(currentInspection, (newInspection) => {
  if (newInspection && selectedPoint.value) {
    const updatedPoint = newInspection.items.find(
      (item) => item.id === selectedPoint.value?.id
    );
    if (updatedPoint) {
      selectedPoint.value = updatedPoint;
    }
  }
}, { deep: true });

onMounted(() => {
  const inspectionId = Number(route.params.id);
  inspectionsStore.fetchInspectionById(inspectionId).then(() => {
    if (currentInspection.value && currentInspection.value.items.length > 0 && !selectedPoint.value) {
      selectedPoint.value = currentInspection.value.items[0];
    }
  });
  if (window.Cypress) {
    console.log('[Componente Vue]: Expondo funções e estado para o Cypress...');
    window.Cypress.vue = {
      requestStatusChange,
      confirmStatusChange,
      getState: () => ({
        selectedPoint: selectedPoint.value,
        isStatusConfirmOpen: isStatusConfirmOpen.value,
        pendingStatusChange: pendingStatusChange.value,
      }),
    };
  }
});
</script>

<style scoped>
.image-container {
  position: relative;
  cursor: pointer;
  width: 100%;
}

.image-thumbnail {
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-thumbnail:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.image-container:hover .image-overlay {
  opacity: 1;
}
</style>