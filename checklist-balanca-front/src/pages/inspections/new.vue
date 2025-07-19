<template>
  <v-container>
    <v-card max-width="900px" class="mx-auto pa-4" elevation="2">
      <v-card-title class="text-h5 font-weight-bold">
        Nova Inspeção - Dados Gerais
      </v-card-title>
      <v-card-subtitle>
        Preencha os dados iniciais para gerar o checklist.
      </v-card-subtitle>

      <v-card-text class="mt-4">
        <v-form @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.inspectorName"
                label="Nome do Inspetor"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.driverName"
                label="Nome do Motorista"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.entryRegistration"
                label="Registro de Entrada (Opcional)"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.vehiclePlates"
                label="Placa do Veículo (Opcional)"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
             <v-col cols="12" md="6">
              <v-text-field
                v-model="form.transportDocument"
                label="N° Transporte (Opcional)"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12"><v-divider class="my-2"></v-divider></v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.modalityId"
                :items="modalities"
                item-title="name"
                item-value="id"
                label="Modalidade"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.operationTypeId"
                :items="operationTypes"
                item-title="name"
                item-value="id"
                label="Operação"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.unitTypeId"
                :items="unitTypes"
                item-title="name"
                item-value="id"
                label="Tipo de Unidade"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.containerTypeId"
                :items="containerTypes"
                item-title="name"
                item-value="id"
                label="Tipo de Contêiner (Opcional)"
                variant="outlined"
                density="compact"
                clearable
              ></v-select>
            </v-col>
            
            <v-col cols="12"><v-divider class="my-2"></v-divider><p class="text-caption">Medidas Verificadas (Opcional)</p></v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.verifiedLength"
                    label="Comprimento (m)"
                    type="number"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.verifiedWidth"
                    label="Largura (m)"
                    type="number"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field
                    v-model.number="form.verifiedHeight"
                    label="Altura (m)"
                    type="number"
                    variant="outlined"
                    density="compact"
                ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          size="large"
          :loading="isLoading"
          :disabled="isLoading"
          @click="submitForm"
        >
          Iniciar Checklist dos 18 Pontos
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/auto';
import { useInspectionsStore } from '@/stores/inspections';
import { storeToRefs } from 'pinia';
import type { CreateInspectionDto } from '@/models/create-inspection.dto';

const router = useRouter();
const inspectionsStore = useInspectionsStore();
const { isLoading, modalities, operationTypes, unitTypes, containerTypes } = storeToRefs(inspectionsStore);

const form = reactive<Partial<CreateInspectionDto>>({
  inspectorName: '',
  driverName: '',
  entryRegistration: '',
  vehiclePlates: '',
  transportDocument: '',
  modalityId: undefined,
  operationTypeId: undefined,
  unitTypeId: undefined,
  containerTypeId: undefined,
  verifiedLength: undefined,
  verifiedWidth: undefined,
  verifiedHeight: undefined,
});

const submitForm = async () => {
  // A lógica da store agora orquestra a verificação e a criação.
  const newInspection = await inspectionsStore.createInspection(form as CreateInspectionDto);

  // O componente só se preocupa com a navegação em caso de sucesso.
  if (newInspection) {
    router.push(`/inspections/${newInspection.id}`);
  }
};

onMounted(() => {
  inspectionsStore.fetchFormLookups();
});
</script>