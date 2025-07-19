import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInspectionsStore } from './inspections';
import { apiService } from '@/services/apiService';
import type { Inspection, CreateInspectionDto, Lookup, UpdateInspectionChecklistItemDto } from '@/models';

// Mock completo do apiService.
vi.mock('@/services/apiService', () => ({
  apiService: {
    getInspections: vi.fn(),
    getInspectionById: vi.fn(),
    getLookups: vi.fn(),
    checkExistingInspection: vi.fn(),
    createInspection: vi.fn(),
    updateChecklistItem: vi.fn(),
  },
}));

describe('Inspections Store', () => {
  let store: ReturnType<typeof useInspectionsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useInspectionsStore();
    vi.clearAllMocks();
  });

  it('deve buscar e armazenar a lista de inspeções', async () => {
    // Arrange
    const mockInspections = [{ id: 1 }] as Inspection[];
    (apiService.getInspections as vi.Mock).mockResolvedValue(mockInspections);

    // Act
    await store.fetchInspections();

    // Assert
    expect(apiService.getInspections).toHaveBeenCalledTimes(1);
    expect(store.inspections).toEqual(mockInspections);
  });

  it('deve buscar e armazenar os dados de lookup para o formulário', async () => {
    // Arrange
    const mockModalities = [{ id: 1, name: 'RODOVIARIO' }] as Lookup[];
    (apiService.getLookups as vi.Mock).mockResolvedValue(mockModalities);

    // Act
    await store.fetchFormLookups();

    // Assert
    expect(apiService.getLookups).toHaveBeenCalledWith('modalities');
    expect(store.modalities).toEqual(mockModalities);
  });

  it('deve buscar uma inspeção por ID e armazená-la como a inspeção atual', async () => {
    // Arrange
    const mockInspection = { id: 123, items: [] } as Inspection;
    (apiService.getInspectionById as vi.Mock).mockResolvedValue(mockInspection);

    // Act
    await store.fetchInspectionById(123);

    // Assert
    expect(apiService.getInspectionById).toHaveBeenCalledWith(123);
    expect(store.currentInspection).toEqual(mockInspection);
  });

  describe('createInspection', () => {
    const dto = { inspectorName: 'Teste' } as CreateInspectionDto;

    it('deve criar uma inspeção diretamente se não houver duplicatas', async () => {
      // Arrange
      const newInspection = { id: 1 } as Inspection;
      // Simula que nenhuma inspeção existente foi encontrada
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue({ existingId: null });
      (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);
      
      // Act
      const result = await store.createInspection(dto);

      // Assert
      expect(apiService.checkExistingInspection).toHaveBeenCalledWith(dto);
      expect(apiService.createInspection).toHaveBeenCalledWith(dto);
      expect(result).toEqual(newInspection);
    });

    it('deve pedir confirmação e criar a inspeção se o usuário aceitar', async () => {
        // Arrange
        const newInspection = { id: 2 } as Inspection;
        (apiService.checkExistingInspection as vi.Mock).mockResolvedValue({ existingId: 1 });
        (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);
        // Simulamos o usuário clicando "OK" no confirm()
        window.confirm = vi.fn(() => true);

        // Act
        const result = await store.createInspection(dto);

        // Assert
        expect(window.confirm).toHaveBeenCalled();
        expect(apiService.createInspection).toHaveBeenCalledTimes(1);
        expect(result).toEqual(newInspection);
    });

    it('deve parar a execução se o usuário cancelar a criação de uma duplicata', async () => {
        // Arrange
        (apiService.checkExistingInspection as vi.Mock).mockResolvedValue({ existingId: 1 });
        // Simulamos o usuário clicando "Cancelar"
        window.confirm = vi.fn(() => false);

        // Act
        const result = await store.createInspection(dto);
        
        // Assert
        expect(window.confirm).toHaveBeenCalled();
        expect(apiService.createInspection).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });
  });

  it('deve atualizar um item do checklist na inspeção atual', async () => {
    // Arrange
    const initialItem = { masterPointId: 1, statusId: 1, observations: '' };
    store.currentInspection = { id: 1, items: [initialItem] } as any;
    
    const updatedItemData: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };
    const apiResponse = { ...initialItem, ...updatedItemData };
    (apiService.updateChecklistItem as vi.Mock).mockResolvedValue(apiResponse);

    // Act
    await store.updateChecklistItem(1, updatedItemData);

    // Assert
    expect(apiService.updateChecklistItem).toHaveBeenCalledWith(1, 1, updatedItemData);
    expect(store.currentInspection?.items[0].statusId).toBe(2);
  });
});