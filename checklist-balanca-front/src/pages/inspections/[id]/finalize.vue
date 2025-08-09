<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-btn icon="mdi-arrow-left" data-testid="back-btn" @click="router.back()"></v-btn>
      <v-app-bar-title>Revisar e Finalizar Inspeção</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-overlay :model-value="isLoading || isSubmitting" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        <div class="mt-4 text-center">{{ loadingMessage }}</div>
      </v-overlay>

      <v-container v-if="currentInspection && form">
        <v-card max-width="1200px" class="mx-auto" elevation="2" data-testid="finalize-card">
          <v-card-item class="pa-4">
            <div class="d-flex justify-space-between align-center flex-wrap">
              <div>
                <v-card-title class="text-h5 font-weight-bold">Revisão Final</v-card-title>
                <v-card-subtitle>Checklist #{{ currentInspection.id }}</v-card-subtitle>
              </div>
              <div class="d-flex align-center flex-wrap">
                <v-chip :color="finalStatus.color" variant="elevated" size="large" class="ma-2">
                  <v-icon start :icon="finalStatus.icon"></v-icon>
                  Resultado: {{ finalStatus.text }}
                </v-chip>
                <v-btn v-if="!isEditing" color="primary" @click="isEditing = true" data-testid="edit-btn">
                  <v-icon start>mdi-pencil</v-icon>
                  Liberar Edição
                </v-btn>
                <v-btn v-else color="secondary" @click="saveChanges" :loading="isSubmitting" data-testid="save-btn">
                  <v-icon start>mdi-content-save</v-icon>
                  Salvar Alterações
                </v-btn>
              </div>
            </div>
          </v-card-item>
          <v-divider></v-divider>

          <v-card-text>
            <v-form ref="formRef">
              <p class="text-h6 font-weight-medium mb-4">Dados Gerais</p>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field v-model="form.inspectorName" label="Nome do Inspetor" :readonly="!isEditing"
                    variant="outlined" density="compact" data-testid="inspector-name-input"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6"><v-text-field v-model="form.driverName" label="Nome do Motorista"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="form.entryRegistration" label="Registro de Entrada"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model="form.vehiclePlates" label="Placa do Veículo" :readonly="!isEditing"
                    variant="outlined" density="compact" data-testid="vehicle-plates-input"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4"><v-text-field v-model="form.transportDocument" label="Nº Documento Transporte"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>

                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="form.modalityId" :items="modalities" item-title="name" item-value="id"
                    label="Modalidade" :readonly="!isEditing" variant="outlined" density="compact"></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="form.operationTypeId" :items="operationTypes" item-title="name" item-value="id"
                    label="Operação" :readonly="!isEditing" variant="outlined" density="compact"></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="form.unitTypeId" :items="unitTypes" item-title="name" item-value="id"
                    label="Tipo de Unidade" :readonly="!isEditing" variant="outlined" density="compact"></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select v-model="form.containerTypeId" :items="containerTypes" item-title="name" item-value="id"
                    label="Tipo de Contêiner" :readonly="!isEditing" variant="outlined" density="compact"
                    clearable></v-select>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Medidas e Lacres</p>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedLength" label="Comprimento (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedWidth" label="Largura (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field v-model.number="form.verifiedHeight" label="Altura (m)" :rules="measurementRules"
                    type="number" :readonly="!isEditing" variant="outlined" density="compact"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealUagaPostInspection"
                    label="Lacre UAGA (Pós-Inspeção)" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealUagaPostLoading"
                    label="Lacre UAGA (Pós-Carregamento)" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealShipper" label="Lacre Armador"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6" md="3"><v-text-field v-model="form.sealRfb" label="Lacre RFB"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-text-field></v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Verificação de Lacres de Saída</p>
              <v-row>
                <v-col cols="12" sm="6"><v-text-field v-model="form.sealVerificationResponsibleName"
                    label="Nome do Responsável" :readonly="!isEditing" variant="outlined"
                    density="compact"></v-text-field></v-col>
                <v-col cols="12" sm="6">
                  <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-text-field :model-value="formattedDate" label="Data da Verificação"
                        prepend-inner-icon="mdi-calendar" readonly v-bind="props" :disabled="!isEditing"
                        variant="outlined" density="compact"></v-text-field>
                    </template>
                    <v-date-picker v-model="rawDate" @update:model-value="dateMenu = false" hide-actions title=""
                      color="primary"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationRfbStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Lacre RFB"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationShipperStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Lacre Armador"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
                <v-col cols="12" sm="4"><v-select v-model="form.sealVerificationTapeStatusId"
                    :items="sealVerificationStatuses" item-title="name" item-value="id" label="Status Fita Lacre"
                    :readonly="!isEditing" variant="outlined" density="compact"></v-select></v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>

              <p class="text-h6 font-weight-medium mb-4">Observações Finais</p>
              <v-row>
                <v-col cols="12" md="6"><v-textarea v-model="form.observations" label="Observações Gerais"
                    :readonly="!isEditing" variant="outlined" rows="4" auto-grow></v-textarea></v-col>
                <v-col cols="12" md="6"><v-textarea v-model="form.actionTaken" label="Providências Tomadas"
                    :readonly="!isEditing" variant="outlined" rows="4" auto-grow></v-textarea></v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn size="x-large" color="success" :loading="isSubmitting" :disabled="isLoading || isEditing"
              @click="handleFinalize" data-testid="submit-finalize-btn">
              <v-icon start>mdi-file-pdf-box</v-icon>
              Finalizar e Ir para Relatório
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { UpdateInspectionDto } from '@/models';

const route = useRoute();
const router = useRouter();
const inspectionsStore = useInspectionsStore();
const {
  currentInspection,
  isLoading,
  isSubmitting,
  sealVerificationStatuses,
  modalities,
  operationTypes,
  unitTypes,
  containerTypes
} = storeToRefs(inspectionsStore);

const formRef = ref<any>(null);
const isEditing = ref(false);
const form = reactive<Partial<UpdateInspectionDto>>({});
const loadingMessage = ref('Carregando dados da revisão...');
const dateMenu = ref(false);
const rawDate = ref<Date | null>(null);

const measurementRules = [
  (v: string | number) => {
    if (v === null || v === undefined || v === '') return true;
    if (!/^-?\d+([.,]\d{1,2})?$/.test(String(v))) {
      return 'Formato inválido (ex: 12.34 ou 12,34)';
    }
    if (Number(String(v).replace(',', '.')) >= 100000000) {
      return 'Valor muito alto (máx 8 dígitos antes do separador).'
    }
    return true;
  },
];

const formattedDate = computed(() => {
  return rawDate.value ? rawDate.value.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
});

watch(rawDate, (newDate) => {
  if (newDate) {
    form.sealVerificationDate = newDate.toISOString().split('T')[0];
  } else {
    form.sealVerificationDate = undefined;
  }
});

const finalStatus = computed(() => {
  // Se não há inspeção carregada, retorna um estado padrão.
  if (!currentInspection.value?.items) {
    return { text: 'Indefinido', color: 'grey', icon: 'mdi-help-circle' };
  }

  const items = currentInspection.value.items;

  // Checa se algum item ainda não foi avaliado.
  // O statusId para "EM INSPEÇÃO" é 1
  const isEmAnalise = items.some(item => item.statusId === 1);
  if (isEmAnalise) {
    return { text: 'EM ANÁLISE', color: 'warning', icon: 'mdi-magnify-scan' };
  }

  // Se todos foram avaliados, verifica se há reprovação.
  // O statusId para "NÃO CONFORME" é 3.
  const isReprovado = items.some(item => item.statusId === 3);
  if (isReprovado) {
    return { text: 'REPROVADO', color: 'error', icon: 'mdi-close-octagon' };
  }

  // Se todos foram avaliados e nenhum foi reprovado.
  return { text: 'APROVADO', color: 'success', icon: 'mdi-check-decagram' };
});

const saveChanges = async () => {
  if (!currentInspection.value) return;

  const { valid } = await formRef.value?.validate() ?? { valid: false };
  if (!valid) return;

  // 1. Criamos uma cópia limpa do formulário para enviar.
  const payload: { [key: string]: any } = { ...form };

  // 2. Definimos os campos que precisam de tratamento especial.
  const fieldsToParse: (keyof UpdateInspectionDto)[] = ['verifiedLength', 'verifiedWidth', 'verifiedHeight'];

  // 3. Iteramos e corrigimos cada campo.
  for (const field of fieldsToParse) {
    const value = payload[field];
    if (value !== null && value !== undefined && value !== '') {
      // Convertemos para string, trocamos a vírgula por ponto, e convertemos para número.
      payload[field] = parseFloat(String(value).replace(',', '.'));
    }
  }

  loadingMessage.value = 'Salvando alterações...';
  // 4. Enviamos o payload corrigido para a store.
  await inspectionsStore.updateInspection(currentInspection.value.id, payload as UpdateInspectionDto);
  isEditing.value = false;
};

const handleFinalize = async () => {
  // Guardamos o ID da inspeção a partir da rota no início da função.
  const inspectionId = Number(route.params.id);

  if (!inspectionId) return; // Guarda de segurança
  
  if (isEditing.value) {
    alert('Por favor, salve suas alterações antes de finalizar a inspeção.');
    return;
  }
  
  loadingMessage.value = 'Finalizando inspeção...';
  try {
    await inspectionsStore.finalizeInspection(inspectionId);
    
    // Usamos o 'inspectionId' que guardamos
    router.push(`/inspections/${inspectionId}/report`);

  } catch (error) {
    const errorMessage = (error as any)?.response?.data?.message?.join(', ') || (error as Error).message;
    alert(`Erro ao finalizar: ${errorMessage}`);
  }
};

onMounted(() => {
  const inspectionId = Number(route.params.id);
  inspectionsStore.fetchInspectionById(inspectionId);
  inspectionsStore.fetchSealVerificationStatuses();
  inspectionsStore.fetchFormLookups();
});

watch(currentInspection, (newVal) => {
  if (newVal) {
    Object.assign(form, {
      inspectorName: newVal.inspectorName,
      driverName: newVal.driverName,
      entryRegistration: newVal.entryRegistration,
      vehiclePlates: newVal.vehiclePlates,
      transportDocument: newVal.transportDocument,
      modalityId: newVal.modalityId,
      operationTypeId: newVal.operationTypeId,
      unitTypeId: newVal.unitTypeId,
      containerTypeId: newVal.containerTypeId,
      verifiedLength: newVal.verifiedLength,
      verifiedWidth: newVal.verifiedWidth,
      verifiedHeight: newVal.verifiedHeight,
      sealUagaPostInspection: newVal.sealUagaPostInspection,
      sealUagaPostLoading: newVal.sealUagaPostLoading,
      sealShipper: newVal.sealShipper,
      sealRfb: newVal.sealRfb,
      sealVerificationResponsibleName: newVal.sealVerificationResponsibleName,
      sealVerificationDate: newVal.sealVerificationDate,
      sealVerificationRfbStatusId: newVal.sealVerificationRfbStatusId,
      sealVerificationShipperStatusId: newVal.sealVerificationShipperStatusId,
      sealVerificationTapeStatusId: newVal.sealVerificationTapeStatusId,
      observations: newVal.observations,
      actionTaken: newVal.actionTaken,
    });
    if (newVal.sealVerificationDate) {
      rawDate.value = new Date(`${newVal.sealVerificationDate}T00:00:00Z`);
    }
  }
}, { immediate: true, deep: true });
</script>