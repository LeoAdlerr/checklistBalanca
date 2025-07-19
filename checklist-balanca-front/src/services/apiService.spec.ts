import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiService } from './apiService';
import type { CreateInspectionDto } from '@/models';

// Mock da função fetch global
global.fetch = vi.fn();

// Helper para criar uma resposta de fetch mockada
const createFetchResponse = (ok: boolean, data: any) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
  } as Response);
};

describe('apiService', () => {
  // Definimos a URL base que será usada tanto pelo serviço quanto pelos testes.
  const MOCK_API_URL = 'http://localhost:8888';

  beforeEach(() => {
    (fetch as vi.Mock).mockClear();
    // Antes de cada teste, simulamos a variável de ambiente do Vite.
    // Isso garante que o BASE_URL dentro do apiService tenha o valor que esperamos.
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_API_BASE_URL: MOCK_API_URL,
        },
      },
    });
  });
  
  afterEach(() => {
    // Restauramos a variável global para não afetar outros testes.
    vi.unstubAllGlobals();
  });

  describe('getInspections', () => {
    it('deve buscar e retornar uma lista de inspeções', async () => {
      // Arrange
      const mockData = [{ id: 1, inspectorName: 'Teste' }];
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockData));
      
      // Act
      const result = await apiService.getInspections();
      
      // Assert
      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections`);
      expect(result).toEqual(mockData);
    });

    it('deve retornar um array vazio em caso de falha', async () => {
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(false, {}));
      const result = await apiService.getInspections();
      expect(result).toEqual([]);
    });
  });

  describe('createInspection', () => {
    it('deve enviar os dados corretos e criar uma inspeção', async () => {
      const dto: CreateInspectionDto = { inspectorName: 'Novo Inspetor' } as any;
      const mockResponse = { id: 2, ...dto };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));

      const result = await apiService.createInspection(dto);

      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections`, 
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dto),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar um erro em caso de falha na criação', async () => {
      const dto: CreateInspectionDto = {} as any;
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(false, { message: 'Erro do servidor' }));
      
      await expect(apiService.createInspection(dto)).rejects.toThrow('Erro do servidor');
    });
  });
  
  describe('checkExistingInspection', () => {
    it('deve enviar os dados para verificação e retornar o resultado', async () => {
      const dto: CreateInspectionDto = { inspectorName: 'Inspetor Existente' } as any;
      const mockResponse = { existingId: 123 };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));

      const result = await apiService.checkExistingInspection(dto);

      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/check-existing`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dto),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateChecklistItem', () => {
    it('deve enviar uma requisição PATCH para o endpoint correto', async () => {
      const dto: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };
      const mockResponse = { id: 1, ...dto };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));

      await apiService.updateChecklistItem(1, 5, dto);

      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1/points/5`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(dto),
        }),
      );
    });
  });

  describe('uploadEvidence', () => {
    it('deve enviar um FormData com o arquivo', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const mockResponse = { id: 1, fileName: 'test.png' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));

      await apiService.uploadEvidence(1, 3, file);

      expect(fetch).toHaveBeenCalledWith(
        `${MOCK_API_URL}/inspections/1/points/3/evidence`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData), // Verifica se o corpo é um FormData
        }),
      );
    });
  });

  describe('downloadReportPdf', () => {
    it('deve baixar o relatório e retornar um Blob', async () => {
      const mockBlob = new Blob(['conteudo-do-pdf']);
      (fetch as vi.Mock).mockReturnValue(Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response));

      const result = await apiService.downloadReportPdf(1);

      expect(fetch).toHaveBeenCalledWith(`${MOCK_API_URL}/inspections/1/report/pdf`);
      expect(result).toBeInstanceOf(Blob);
    });
  });
});