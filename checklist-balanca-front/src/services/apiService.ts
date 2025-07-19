import type { Inspection, CreateInspectionDto, Lookup, InspectionChecklistItem, ItemEvidence, UpdateInspectionChecklistItemDto } from '@/models';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    const response = await fetch(`${BASE_URL}/inspections/${id}`);
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
  if (response.status === 404) {
    // Se o status for 404, significa que não há duplicatas. Retornamos null.
    return null;
  }
  
  if (!response.ok) {
    // Para qualquer outro erro (500, 400, etc.), lançamos uma exceção.
    throw new Error('Falha ao verificar inspeção existente');
  }

  // Se o status for 200, significa que uma duplicata foi encontrada. Retornamos os dados.
  return await response.json();
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
    formData.append('file', file);

    // Nota: Ao usar fetch com FormData, não definimos o 'Content-Type'.
    // O navegador faz isso automaticamente com o 'boundary' correto.
    const response = await fetch(`${BASE_URL}/inspections/${inspectionId}/points/${pointNumber}/evidence`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Falha ao enviar evidência');
    return await response.json();
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
    // Retorna o arquivo como um Blob, que pode ser usado para criar um link de download.
    return await response.blob();
  },
};