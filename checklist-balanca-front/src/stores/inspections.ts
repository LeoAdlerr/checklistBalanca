import { defineStore } from 'pinia';
import { useRouter } from 'vue-router/auto';
import { apiService } from '@/services/apiService';
import type { Inspection, CreateInspectionDto, Lookup, UpdateInspectionChecklistItemDto } from '@/models';

interface InspectionsState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  error: string | null;
  modalities: Lookup[];
  operationTypes: Lookup[];
  unitTypes: Lookup[];
  containerTypes: Lookup[];
}

export const useInspectionsStore = defineStore('inspections', {
  state: (): InspectionsState => ({
    inspections: [],
    currentInspection: null,
    isLoading: false,
    error: null,
    modalities: [],
    operationTypes: [],
    unitTypes: [],
    containerTypes: [],
  }),

  actions: {
    async fetchInspections() {
      this.isLoading = true;
      this.error = null;
      try {
        this.inspections = await apiService.getInspections();
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchFormLookups() {
      this.isLoading = true;
      try {
        [
          this.modalities,
          this.operationTypes,
          this.unitTypes,
          this.containerTypes,
        ] = await Promise.all([
          apiService.getLookups('modalities'),
          apiService.getLookups('operation-types'),
          apiService.getLookups('unit-types'),
          apiService.getLookups('container-types'),
        ]);
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },
    async fetchInspectionById(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        this.currentInspection = await apiService.getInspectionById(id);
      } catch (err) {
        this.error = (err as Error).message;
        this.currentInspection = null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 
     * Orquestra o fluxo de criação, incluindo a verificação de duplicatas.
     */
    async createInspection(data: CreateInspectionDto): Promise<Inspection | undefined> {
    this.isLoading = true;
    this.error = null;
    try {
      // Agora recebemos o objeto de inspeção completo ou nulo
      const existingInspection = await apiService.checkExistingInspection(data);

      if (existingInspection) {
        // Formatamos a data para exibição
        const formattedDate = new Date(existingInspection.createdAt).toLocaleString('pt-BR');
        
        // Criamos a mensagem de confirmação rica em detalhes
        const proceed = confirm(
          `Atenção: Já existe uma inspeção em andamento com dados similares (ID: ${existingInspection.id}), criada em ${formattedDate}.\n\nDeseja criar uma nova inspeção mesmo assim?`
        );
        
        if (!proceed) {
          return undefined;
        }
      }
      
      const newInspection = await apiService.createInspection(data);
      return newInspection;

    } catch (err) {
      this.error = (err as Error).message;
      alert(this.error);
      return undefined;
    } finally {
      this.isLoading = false;
    }
  },

    async updateChecklistItem(pointNumber: number, data: UpdateInspectionChecklistItemDto) {
      if (!this.currentInspection) return;
      this.isLoading = true;
      try {
        const updatedItem = await apiService.updateChecklistItem(this.currentInspection.id, pointNumber, data);
        const itemIndex = this.currentInspection.items.findIndex(i => i.masterPointId === pointNumber);
        if (itemIndex !== -1) {
          this.currentInspection.items[itemIndex] = { ...this.currentInspection.items[itemIndex], ...updatedItem };
        }
      } catch (err) {
        this.error = (err as Error).message;
        alert(this.error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});