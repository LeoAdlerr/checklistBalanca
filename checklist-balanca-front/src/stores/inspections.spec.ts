import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInspectionsStore } from './inspections';
import { apiService } from '@/services/apiService';
import type { Inspection, CreateInspectionDto, Lookup } from '@/models';

// Mock do apiService
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
    vi.resetAllMocks(); // Usamos resetAllMocks para isolar os testes

    // Mockamos a função global 'confirm' antes de cada teste
    // Por padrão, simulamos que o usuário sempre clica "OK" (true)
    window.confirm = vi.fn(() => true);
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
      // Simulamos o serviço retornando 'null' diretamente.
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(null);
      (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);

      // Act
      await store.createInspection(dto);

      // Assert
      expect(apiService.checkExistingInspection).toHaveBeenCalledWith(dto);
      expect(window.confirm).not.toHaveBeenCalled(); // Agora esta asserção vai passar
      expect(apiService.createInspection).toHaveBeenCalledWith(dto);
    });

    it('deve pedir confirmação e criar a inspeção se o usuário aceitar', async () => {
      // Arrange
      const newInspection = { id: 2 } as Inspection;
      // O mock  retorna o objeto de inspeção completo, como a API real faria.
      const existingInspection = { id: 1, createdAt: new Date().toISOString() } as Inspection;
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(existingInspection);
      (apiService.createInspection as vi.Mock).mockResolvedValue(newInspection);

      // Act
      await store.createInspection(dto);

      // Assert
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(apiService.createInspection).toHaveBeenCalledTimes(1);
    });

    it('deve parar a execução se o usuário cancelar a criação de uma duplicata', async () => {
      // Arrange
      const existingInspection = { id: 1, createdAt: new Date().toISOString() } as Inspection;
      (apiService.checkExistingInspection as vi.Mock).mockResolvedValue(existingInspection);
      (window.confirm as vi.Mock).mockReturnValue(false); // Simula o "cancelar"

      // Act
      const result = await store.createInspection(dto);

      // Assert
      expect(window.confirm).toHaveBeenCalledTimes(1);
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