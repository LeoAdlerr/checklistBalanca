import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInspectionsStore } from './inspections';
import { apiService } from '@/services/apiService';
import type { Inspection, Lookup, UpdateInspectionDto } from '@/models';
import type { InspectionChecklistItem, ItemEvidence } from '@/models/inspection.model';

// Mock do apiService completo
vi.mock('@/services/apiService', () => ({
  apiService: {
    getInspections: vi.fn(),
    getInspectionById: vi.fn(),
    getLookups: vi.fn(),
    checkExistingInspection: vi.fn(),
    createInspection: vi.fn(),
    updateChecklistItem: vi.fn(),
    uploadEvidence: vi.fn(),
    deleteEvidence: vi.fn(),
    finalizeInspection: vi.fn(),
    downloadReportPdf: vi.fn(),
    updateInspection: vi.fn(),
    deleteInspection: vi.fn(),
    getReportHtml: vi.fn(),
    downloadEvidence: vi.fn(),
  },
}));

describe('Inspections Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });

  it('deve buscar e armazenar a lista de inspeções', async () => {
    // Cria a instância da store dentro do teste
    const store = useInspectionsStore();
    const mockInspections = [{ id: 1 }] as Inspection[];
    (apiService.getInspections as vi.Mock).mockResolvedValue(mockInspections);

    await store.fetchInspections();

    expect(apiService.getInspections).toHaveBeenCalledTimes(1);
    expect(store.inspections).toEqual(mockInspections);
  });

  it('deve buscar e armazenar os dados de lookup para o formulário', async () => {
    const store = useInspectionsStore();
    const mockModalities = [{ id: 1, name: 'RODOVIARIO' }] as Lookup[];
    (apiService.getLookups as vi.Mock).mockResolvedValue(mockModalities);

    await store.fetchFormLookups();

    expect(apiService.getLookups).toHaveBeenCalledWith('modalities');
    expect(store.modalities).toEqual(mockModalities);
  });

  it('deve buscar uma inspeção por ID e armazená-la como a inspeção atual', async () => {
    const store = useInspectionsStore();
    const mockInspection = { id: 123, items: [] } as Inspection;
    (apiService.getInspectionById as vi.Mock).mockResolvedValue(mockInspection);

    await store.fetchInspectionById(123);

    expect(apiService.getInspectionById).toHaveBeenCalledWith(123);
    expect(store.currentInspection).toEqual(mockInspection);
  });

  describe('createInspection', () => {
    const dto = { inspectorName: 'Teste' } as CreateInspectionDto;

    it('deve criar uma inspeção diretamente se não houver duplicatas', async () => {
      const store = useInspectionsStore();
      const newInspection = { id: 1 } as Inspection;
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(null);
      (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);

      await store.createInspection(dto);

      expect(apiService.checkExistingInspection).toHaveBeenCalledWith(dto);
      expect(window.confirm).not.toHaveBeenCalled();
      expect(apiService.createInspection).toHaveBeenCalledWith(dto);
    });

    it('deve pedir confirmação e criar a inspeção se o usuário aceitar', async () => {
      const store = useInspectionsStore();
      const newInspection = { id: 2 } as Inspection;
      const existingInspection = { id: 1, createdAt: new Date().toISOString() } as Inspection;
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(existingInspection);
      (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);

      await store.createInspection(dto);

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(apiService.createInspection).toHaveBeenCalledTimes(1);
    });

    it('deve parar a execução se o usuário cancelar a criação de uma duplicata', async () => {
      const store = useInspectionsStore();
      const existingInspection = { id: 1, createdAt: new Date().toISOString() } as Inspection;
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(existingInspection);
      (window.confirm as vi.Mock).mockReturnValue(false);

      const result = await store.createInspection(dto);

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(apiService.createInspection).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  it('deve atualizar um item do checklist na inspeção atual', async () => {
    const store = useInspectionsStore();
    const initialItem = { masterPointId: 1, statusId: 1, observations: '' };
    store.currentInspection = { id: 1, items: [initialItem] } as any;
    const updatedItemData: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };
    const apiResponse = { ...initialItem, ...updatedItemData };
    (apiService.updateChecklistItem as vi.Mock).mockResolvedValue(apiResponse);

    await store.updateChecklistItem(1, updatedItemData);

    expect(apiService.updateChecklistItem).toHaveBeenCalledWith(1, 1, updatedItemData);
    expect(store.currentInspection?.items[0].statusId).toBe(2);
  });

  describe('deleteEvidence', () => {
    it('deve chamar o apiService.deleteEvidence e remover a evidência do estado local', async () => {
      const store = useInspectionsStore();
      const mockEvidence: ItemEvidence = { id: 101, fileName: 'test.png' } as any;
      const mockItem: InspectionChecklistItem = { id: 1, masterPointId: 1, evidences: [mockEvidence] } as any;
      store.currentInspection = { id: 1, items: [mockItem] } as any;
      (apiService.deleteEvidence as vi.Mock).mockResolvedValue(undefined);

      await store.deleteEvidence(mockItem, mockEvidence);

      expect(apiService.deleteEvidence).toHaveBeenCalledWith(1, 1, 'test.png');
      expect(store.currentInspection?.items[0].evidences).toHaveLength(0);
    });

    it('deve tratar o erro se a chamada da API falhar', async () => {
      const store = useInspectionsStore();
      const mockEvidence: ItemEvidence = { id: 101, fileName: 'test.png' } as any;
      const mockItem: InspectionChecklistItem = { id: 1, masterPointId: 1, evidences: [mockEvidence] } as any;
      store.currentInspection = { id: 1, items: [mockItem] } as any;
      window.alert = vi.fn();
      (apiService.deleteEvidence as vi.Mock).mockRejectedValue(new Error('Falha na API'));

      await store.deleteEvidence(mockItem, mockEvidence);

      expect(store.currentInspection?.items[0].evidences).toHaveLength(1);
      expect(store.error).toContain('Falha na API');
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('finalizeInspection', () => {
    it('deve chamar o apiService e atualizar a inspeção atual em caso de sucesso', async () => {
      const store = useInspectionsStore();
      const inspectionId = 123;
      const finalizedInspection = { id: inspectionId, status: 'REPROVADO' } as Inspection;
      store.currentInspection = { id: inspectionId, status: 'EM INSPEÇÃO' } as Inspection;
      (apiService.finalizeInspection as vi.Mock).mockResolvedValue(finalizedInspection);

      await store.finalizeInspection(inspectionId);

      expect(apiService.finalizeInspection).toHaveBeenCalledWith(inspectionId);
      expect(store.currentInspection).toEqual(finalizedInspection);
      expect(store.isSubmitting).toBe(false);
    });

    it('deve lançar um erro em caso de falha', async () => {
      const store = useInspectionsStore();
      (apiService.finalizeInspection as vi.Mock).mockRejectedValue(new Error('API Error'));

      await expect(store.finalizeInspection(123)).rejects.toThrow('API Error');
      expect(store.error).toBe('API Error');
    });
  });

  describe('downloadReportPdf', () => {
    it('deve chamar o apiService e retornar um Blob', async () => {
      const store = useInspectionsStore();
      const mockBlob = new Blob(['pdf-content']);
      (apiService.downloadReportPdf as vi.Mock).mockResolvedValue(mockBlob);

      const result = await store.downloadReportPdf(123);

      expect(apiService.downloadReportPdf).toHaveBeenCalledWith(123);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('fetchReportHtml', () => {
    it('deve chamar apiService.getReportHtml e armazenar o resultado em currentReportHtml', async () => {
      // Arrange
      const store = useInspectionsStore();
      const inspectionId = 123;
      const mockHtml = '<h1>Relatório Teste</h1>';
      (apiService.getReportHtml as vi.Mock).mockResolvedValue(mockHtml);

      // Act
      await store.fetchReportHtml(inspectionId);

      // Assert
      expect(apiService.getReportHtml).toHaveBeenCalledWith(inspectionId);
      expect(store.currentReportHtml).toBe(mockHtml);
      expect(store.error).toBeNull();
      expect(store.isLoading).toBe(false);
    });

    it('deve armazenar uma mensagem de erro se a chamada da API falhar', async () => {
      // Arrange
      const store = useInspectionsStore();
      const inspectionId = 404;
      const errorMessage = 'Relatório não encontrado';
      (apiService.getReportHtml as vi.Mock).mockRejectedValue(new Error(errorMessage));

      // Act
      await store.fetchReportHtml(inspectionId);

      // Assert
      expect(store.error).toBe(errorMessage);
      expect(store.currentReportHtml).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(window.alert).toHaveBeenCalled(); // Verifica se o alerta foi chamado
    });
  });

  describe('updateInspection', () => {
    it('deve chamar o apiService e recarregar os dados da inspeção', async () => {
      const store = useInspectionsStore();
      const dto: UpdateInspectionDto = { driverName: 'Novo Piloto' };
      (apiService.updateInspection as vi.Mock).mockResolvedValue(undefined);
      (apiService.getInspectionById as vi.Mock).mockResolvedValue({ id: 1, driverName: 'Novo Piloto' });

      await store.updateInspection(1, dto);

      expect(apiService.updateInspection).toHaveBeenCalledWith(1, dto);
      expect(apiService.getInspectionById).toHaveBeenCalledWith(1); // Verifica se os dados foram recarregados
      expect(store.currentInspection?.driverName).toBe('Novo Piloto');
    });
  });

  describe('deleteInspection', () => {
    it('deve chamar o apiService e remover a inspeção da lista local', async () => {
      const store = useInspectionsStore();
      store.inspections = [{ id: 1 }, { id: 2 }] as Inspection[];
      (apiService.deleteInspection as vi.Mock).mockResolvedValue({ message: 'Apagado' });

      await store.deleteInspection(1);

      expect(apiService.deleteInspection).toHaveBeenCalledWith(1);
      expect(store.inspections).toHaveLength(1);
      expect(store.inspections[0].id).toBe(2);
    });
  });

  describe('fetchSealVerificationStatuses', () => {
    it('deve buscar e armazenar os status de verificação de lacre', async () => {
      const store = useInspectionsStore();
      const mockStatuses = [{ id: 1, name: 'OK' }] as Lookup[];
      (apiService.getLookups as vi.Mock).mockResolvedValue(mockStatuses);

      await store.fetchSealVerificationStatuses();

      expect(apiService.getLookups).toHaveBeenCalledWith('seal-verification-statuses');
      expect(store.sealVerificationStatuses).toEqual(mockStatuses);
    });

    it('não deve buscar os status se eles já estiverem carregados', async () => {
      const store = useInspectionsStore();
      store.sealVerificationStatuses = [{ id: 1, name: 'OK' }]; // Preenchemos o estado previamente

      await store.fetchSealVerificationStatuses();

      // A API não deve ser chamada
      expect(apiService.getLookups).not.toHaveBeenCalled();
    });
  });
  
  describe('downloadEvidence', () => {
    const mockEvidence: ItemEvidence = { id: 101, fileName: 'test.png' } as any;
    const mockItem: InspectionChecklistItem = { id: 1, masterPointId: 1, evidences: [mockEvidence] } as any;

    it('deve chamar apiService.downloadEvidence com os parâmetros corretos em caso de sucesso', async () => {
      // Arrange
      const store = useInspectionsStore();
      store.currentInspection = { id: 123, items: [mockItem] } as any;
      const mockBlob = new Blob(['image-content']);
      (apiService.downloadEvidence as vi.Mock).mockResolvedValue(mockBlob);

      // Mocks para a lógica de download no navegador
      window.URL.createObjectURL = vi.fn(() => 'blob:url');
      window.URL.revokeObjectURL = vi.fn();
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();

      // Act
      await store.downloadEvidence(mockItem, mockEvidence);

      // Assert
      expect(apiService.downloadEvidence).toHaveBeenCalledWith(123, 1, 'test.png');
      expect(store.isSubmitting).toBe(false);
      expect(store.error).toBeNull();
    });

    it('deve definir uma mensagem de erro se o download da evidência falhar', async () => {
      // Arrange
      const store = useInspectionsStore();
      store.currentInspection = { id: 123, items: [mockItem] } as any;
      const errorMessage = 'Arquivo não encontrado';
      (apiService.downloadEvidence as vi.Mock).mockRejectedValue(new Error(errorMessage));

      // Act
      await store.downloadEvidence(mockItem, mockEvidence);

      // Assert
      expect(store.error).toBe(errorMessage);
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
      expect(store.isSubmitting).toBe(false);
    });
  });
});