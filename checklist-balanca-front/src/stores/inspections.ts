import { defineStore } from 'pinia';
import { apiService } from '@/services/apiService';
import type {
  Inspection,
  CreateInspectionDto,
  Lookup,
  UpdateInspectionChecklistItemDto,
  InspectionChecklistItem,
  ItemEvidence,
  UpdateInspectionDto
} from '@/models';

interface InspectionsState {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  modalities: Lookup[];
  operationTypes: Lookup[];
  unitTypes: Lookup[];
  containerTypes: Lookup[];
  sealVerificationStatuses: Lookup[];
}

export const useInspectionsStore = defineStore('inspections', {
  state: (): InspectionsState => ({
    inspections: [],
    currentInspection: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    modalities: [],
    operationTypes: [],
    unitTypes: [],
    containerTypes: [],
    sealVerificationStatuses: [],
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

      this.isSubmitting = true; // <-- AJUSTE: Usar isSubmitting para consistência
      this.error = null;
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
        this.isSubmitting = false; // <-- AJUSTE: Usar isSubmitting
      }
    },

    async uploadEvidence(masterPointId: number, file: File) {
      if (!this.currentInspection) {
        throw new Error('No current inspection selected');
      }

      console.log('Starting evidence upload for point:', masterPointId);

      this.isSubmitting = true;
      this.error = null;

      try {
        const newEvidence = await apiService.uploadEvidence(
          this.currentInspection.id,
          masterPointId,
          file
        );

        // Update local state
        const itemIndex = this.currentInspection.items.findIndex(
          p => p.masterPointId === masterPointId
        );

        if (itemIndex > -1) {
          const updatedItem = { ...this.currentInspection.items[itemIndex] };
          updatedItem.evidences = updatedItem.evidences || [];
          updatedItem.evidences.push(newEvidence);
          this.currentInspection.items[itemIndex] = updatedItem;
        }

        return newEvidence;
      } catch (error) {
        console.error('Evidence upload failed:', error);
        this.error = `Falha ao enviar evidência: ${(error as Error).message}`;
        throw error;
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteEvidence(item: InspectionChecklistItem, evidence: ItemEvidence) {
      if (!this.currentInspection) return;
      this.isSubmitting = true;
      this.error = null;
      try {
        await apiService.deleteEvidence(this.currentInspection.id, item.masterPointId, evidence.fileName);
        const itemInStore = this.currentInspection.items.find(i => i.id === item.id);
        if (itemInStore) {
          const evidenceIndex = itemInStore.evidences.findIndex(e => e.id === evidence.id);
          if (evidenceIndex !== -1) {
            itemInStore.evidences.splice(evidenceIndex, 1);
          }
        }
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao apagar evidência: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },
    /**
       * Finaliza uma inspeção, atualizando o seu status.
       */
    async finalizeInspection(id: number) {
      this.isSubmitting = true;
      this.error = null;
      try {
        const finalizedInspection = await apiService.finalizeInspection(id);
        // Atualiza a inspeção atual com os dados finalizados (ex: novo status)
        if (this.currentInspection && this.currentInspection.id === id) {
          this.currentInspection = finalizedInspection;
        }
      } catch (err) {
        this.error = (err as Error).message;
        // Lança o erro para que o componente possa tratá-lo (ex: mostrar um alerta)
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Baixa o relatório PDF de uma inspeção. A lógica de criar o link
     * de download fica no componente, a store apenas busca o arquivo.
     */
    async downloadReportPdf(id: number): Promise<Blob | undefined> {
      this.isLoading = true;
      this.error = null;
      try {
        return await apiService.downloadReportPdf(id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao baixar o relatório: ${this.error}`);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Atualiza os dados do cabeçalho de uma inspeção (ex: nome do motorista).
     */
    async updateInspection(id: number, data: UpdateInspectionDto) {
      this.isSubmitting = true;
      this.error = null;
      try {
        await apiService.updateInspection(id, data);
        // Re-busca os dados para garantir consistência
        await this.fetchInspectionById(id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao atualizar a inspeção: ${this.error}`);
      } finally {
        this.isSubmitting = false;
      }
    },

    /**
     * Apaga uma inspeção da lista.
     */
    async deleteInspection(id: number) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiService.deleteInspection(id);
        // Remove a inspeção da lista local para atualizar a UI
        this.inspections = this.inspections.filter(i => i.id !== id);
      } catch (err) {
        this.error = (err as Error).message;
        alert(`Erro ao apagar a inspeção: ${this.error}`);
      } finally {
        this.isLoading = false;
      }
    },
    
    async fetchSealVerificationStatuses() {
      // Para evitar recarregar dados já existentes
      if (this.sealVerificationStatuses.length > 0) return;

      this.isLoading = true;
      try {
        this.sealVerificationStatuses = await apiService.getLookups('seal-verification-statuses');
      } catch (err) {
        this.error = (err as Error).message;
      } finally {
        this.isLoading = false;
      }
    },
  },

});