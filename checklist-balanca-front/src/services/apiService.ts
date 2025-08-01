import type {
  Inspection,
  CreateInspectionDto,
  Lookup,
  InspectionChecklistItem,
  ItemEvidence,
  UpdateInspectionChecklistItemDto,
  UpdateInspectionDto, // Tipo adicionado para a função 'updateInspection'
} from '@/models';

// Corrigido: Removido o espaço extra no final da URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888';

// Nenhuma outra alteração foi necessária, o seu serviço já está completo!
export const apiService = {
  /**
   * Busca a lista de todas as inspeções.
   */
  async getInspections(): Promise<Inspection[]> {
    try {
      const response = await fetch(`${BASE_URL}/inspections`);
      if (!response.ok) throw new Error('Falha ao buscar inspeções');
      return await response.json();
    } catch (error) {
      console.error('Erro em getInspections:', error);
      return [];
    }
  },
  /**
     * Busca os detalhes completos de uma única inspeção pelo ID.
     */
  async getInspectionById(id: number): Promise<Inspection> {
    const headers = window.Cypress ? { 'X-Cypress-Request': 'true' } : {};

    const response = await fetch(`${BASE_URL}/inspections/${id}`, { headers });

    if (!response.ok) throw new Error(`Falha ao buscar inspeção com ID ${id}`);
    return await response.json();
  },

  /**
   * Busca dados de uma tabela de lookup específica (ex: 'modalities').
   */
  async getLookups(type: string): Promise<Lookup[]> {
    try {
      const response = await fetch(`${BASE_URL}/lookups/${type}`);
      if (!response.ok) throw new Error(`Falha ao buscar lookup: ${type}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro em getLookups(${type}):`, error);
      return [];
    }
  },

  /**
   * Envia os dados do formulário para criar uma nova inspeção.
   */
  async createInspection(data: CreateInspectionDto): Promise<Inspection> {
    const response = await fetch(`${BASE_URL}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao criar inspeção');
    }
    return await response.json();
  },

  /**
   * Verifica se uma inspeção similar já existe.
   */
  async checkExistingInspection(data: CreateInspectionDto): Promise<Inspection | null> {
    const response = await fetch(`${BASE_URL}/inspections/check-existing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Falha ao verificar inspeção existente');
    return await response.json();
  },

  /**
   * Atualiza os dados do cabeçalho de uma inspeção.
   */
  async updateInspection(id: number, data: UpdateInspectionDto): Promise<void> {
    const response = await fetch(`${BASE_URL}/inspections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao atualizar a inspeção');
    }
  },

  /**
   * Apaga uma inspeção completa.
   */
  async deleteInspection(id: number): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/inspections/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao apagar a inspeção');
    }
    return response.json();
  },

  /**
   * Atualiza um item específico do checklist.
   */
  async updateChecklistItem(
    inspectionId: number,
    pointNumber: number,
    data: UpdateInspectionChecklistItemDto
  ): Promise<InspectionChecklistItem> {
    const response = await fetch(`${BASE_URL}/inspections/${inspectionId}/points/${pointNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao atualizar item do checklist');
    }
    return await response.json();
  },

  /**
   * Envia um arquivo de evidência.
   */
  async uploadEvidence(inspectionId: number, pointNumber: number, file: File): Promise<ItemEvidence> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const response = await fetch(`${BASE_URL}/inspections/${inspectionId}/points/${pointNumber}/evidence`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falha ao enviar evidência');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in uploadEvidence:', error);
      throw error;
    }
  },

  /**
   * Apaga uma evidência específica.
   */
  async deleteEvidence(inspectionId: number, pointNumber: number, fileName: string): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/inspections/${inspectionId}/points/${pointNumber}/evidence`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao apagar evidência');
    }
    return response.json();
  },

  /**
   * Finaliza uma inspeção.
   */
  async finalizeInspection(id: number): Promise<Inspection> {
    const response = await fetch(`${BASE_URL}/inspections/${id}/finalize`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha ao finalizar inspeção');
    }
    return await response.json();
  },

  /**
   * Baixa o relatório em PDF.
   */
  async downloadReportPdf(id: number): Promise<Blob> {
    const response = await fetch(`${BASE_URL}/inspections/${id}/report/pdf`);
    if (!response.ok) throw new Error('Falha ao baixar o relatório PDF');
    return await response.blob();
  },
};