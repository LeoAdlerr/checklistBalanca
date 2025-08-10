<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-btn icon="mdi-arrow-left" data-testid="back-btn" @click="router.back()"></v-btn>
      <v-app-bar-title>Relatório da Inspeção</v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-blue-grey-darken-4">
      <v-overlay :model-value="isLoading" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">Carregando Relatório...</div>
      </v-overlay>

      <v-container fluid v-if="!isLoading && currentInspection">
        <v-card max-width="1200px" class="mx-auto" elevation="4" data-testid="report-card">
          <v-card-item class="pa-4">
            <div class="d-flex justify-space-between align-center flex-wrap ga-4">
              <div class="d-flex align-center flex-wrap ga-4">
                <div>
                  <div class="text-caption text-grey">Inspetor</div>
                  <div class="font-weight-medium" data-testid="inspector-name">{{ currentInspection.inspectorName }}</div>
                </div>
                <div>
                  <div class="text-caption text-grey">Motorista</div>
                  <div class="font-weight-medium" data-testid="driver-name">{{ currentInspection.driverName }}</div>
                </div>
                <v-chip :color="finalStatus.color" variant="elevated" size="large" label>
                  <v-icon start :icon="finalStatus.icon"></v-icon>
                  Resultado: {{ finalStatus.text }}
                </v-chip>
              </div>

              <div class="ga-2">
                <v-btn
                  color="indigo-darken-3"
                  prepend-icon="mdi-download"
                  @click="baixarPDF"
                  :loading="isSubmitting"
                  data-testid="download-pdf-btn"
                >
                  Baixar PDF
                </v-btn>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-printer"
                  @click="imprimirRelatorio"
                  data-testid="print-btn"
                >
                  Imprimir
                </v-btn>
              </div>
            </div>
          </v-card-item>
          <v-divider></v-divider>

          <iframe
            v-if="currentReportHtml"
            ref="reportFrame"
            :srcdoc="currentReportHtml"
            frameborder="0"
            width="100%"
            height="800px"
            data-testid="report-iframe"
          ></iframe>
          <v-alert v-else type="error" class="ma-4" data-testid="html-error-alert">
            Não foi possível carregar a pré-visualização do relatório.
          </v-alert>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter(); // router é usado pelo @click="router.back()"
const inspectionsStore = useInspectionsStore();
const { currentInspection, isLoading, isSubmitting, currentReportHtml } = storeToRefs(inspectionsStore);

const reportFrame = ref<HTMLIFrameElement | null>(null);
const inspectionId = Number(route.params.id);

const finalStatus = computed(() => {
  if (!currentInspection.value?.items) {
    return { text: 'INDEFINIDO', color: 'grey', icon: 'mdi-help-circle' };
  }
  const isReprovado = currentInspection.value.items.some(item => item.statusId === 3);
  return isReprovado
    ? { text: 'REPROVADO', color: 'error', icon: 'mdi-close-octagon' }
    : { text: 'APROVADO', color: 'success', icon: 'mdi-check-decagram' };
});

const baixarPDF = async () => {
  // A lógica de download pode ser movida para a store para reuso e melhor gerenciamento de estado
  const blob = await inspectionsStore.downloadReportPdf(inspectionId);
  if (blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inspecao-relatorio-${inspectionId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

const imprimirRelatorio = () => {
  const iframe = reportFrame.value;
  if (iframe?.contentWindow) {
    iframe.contentWindow.print();
  }
};

onMounted(() => {
  if (inspectionId) {
    // Limpa qualquer dado anterior
    inspectionsStore.currentInspection = null;
    inspectionsStore.currentReportHtml = null;
    
    // Inicia as duas chamadas de API em paralelo para agilizar
    Promise.all([
      inspectionsStore.fetchInspectionById(inspectionId),
      inspectionsStore.fetchReportHtml(inspectionId)
    ]);
  }
});
</script>