import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService } from './apiService';
import type { CreateInspectionDto, UpdateInspectionChecklistItemDto, UpdateInspectionDto } from '@/models';

// Mock da função fetch global
global.fetch = vi.fn();

// Helper para criar uma resposta de fetch mockada (sem alterações aqui)
const createFetchResponse = (ok: boolean, data: any, status = 200, isText = false) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob([isText ? data : JSON.stringify(data)])),
  } as Response);
};

describe('apiService', () => {
  // ✅ CORREÇÃO 1: Em vez de uma constante fixa, lemos a variável de ambiente,
  // exatamente como a aplicação faz.
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  beforeEach(() => {
    (fetch as vi.Mock).mockClear();
    // ✅ CORREÇÃO 2: A simulação (stub) da variável de ambiente não é mais necessária,
    // pois estamos a usá-la diretamente, o que torna o teste mais limpo.
    vi.stubGlobal('window', { Cypress: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getInspections', () => {
    it('deve buscar e retornar uma lista de inspeções', async () => {
      const mockData = [{ id: 1, inspectorName: 'Teste' }];
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getInspections();
      
      // ✅ CORREÇÃO 3: Usamos a nova constante dinâmica em vez da MOCK_API_URL.
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections`,
        { headers: {} }
      );

      expect(result).toEqual(mockData);
    });

    it('deve retornar um array vazio em caso de falha', async () => {
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(false, {}));
      const result = await apiService.getInspections();
      expect(result).toEqual([]);
    });
  });

  // 👇 O resto do ficheiro segue o mesmo padrão, usando API_BASE_URL 👇

  describe('getInspectionById', () => {
    it('deve buscar e retornar os detalhes de uma inspeção específica', async () => {
      const mockData = { id: 1, inspectorName: 'Inspetor Detalhe' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getInspectionById(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1`,
        { headers: {} }
      );
      expect(result).toEqual(mockData);
    });
  });
  
  describe('getLookups', () => {
    it('deve buscar e retornar uma lista de lookups para um tipo', async () => {
      const mockData = [{ id: 'A', description: 'Modalidade A' }];
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockData));
      const result = await apiService.getLookups('modalities');
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/lookups/modalities`);
      expect(result).toEqual(mockData);
    });
  });

  describe('createInspection', () => {
    it('deve enviar os dados corretos e criar uma inspeção', async () => {
      const dto: CreateInspectionDto = { inspectorName: 'Novo Inspetor' } as any;
      const mockResponse = { id: 2, ...dto };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));
      const result = await apiService.createInspection(dto);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(dto),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('checkExistingInspection', () => {
    it('deve retornar null se a inspeção não existir (status 404)', async () => {
      const dto: CreateInspectionDto = { inspectorName: 'Inspetor Inexistente' } as any;
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(false, {}, 404));
      const result = await apiService.checkExistingInspection(dto);
      expect(result).toBeNull();
    });
  });

  describe('updateInspection', () => {
    it('deve enviar uma requisição PATCH para atualizar o cabeçalho da inspeção', async () => {
      const dto: UpdateInspectionDto = { driverName: 'Novo Nome' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, {}));
      await apiService.updateInspection(1, dto);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(dto),
        })
      );
    });
  });

  describe('deleteInspection', () => {
    it('deve enviar uma requisição DELETE para apagar uma inspeção', async () => {
      const mockResponse = { message: 'Inspeção apagada' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));
      const result = await apiService.deleteInspection(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateChecklistItem', () => {
    it('deve enviar uma requisição PATCH para o endpoint correto', async () => {
      const dto: UpdateInspectionChecklistItemDto = { statusId: 2, observations: 'OK' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, { id: 1, ...dto }));
      await apiService.updateChecklistItem(1, 5, dto);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1/points/5`,
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
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, { id: 1, fileName: 'test.png' }));
      await apiService.uploadEvidence(1, 3, file);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1/points/3/evidence`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });
  });

  describe('deleteEvidence', () => {
    it('deve enviar uma requisição DELETE com o fileName no corpo', async () => {
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, { message: 'sucesso' }));
      await apiService.deleteEvidence(1, 5, 'evidence-to-delete.png');
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1/points/5/evidence`,
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ fileName: 'evidence-to-delete.png' }),
        }),
      );
    });
  });

  describe('finalizeInspection', () => {
    it('deve enviar uma requisição PATCH para finalizar uma inspeção', async () => {
      const mockResponse = { id: 1, status: 'APROVADO' };
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(true, mockResponse));
      const result = await apiService.finalizeInspection(1);
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/inspections/1/finalize`,
        expect.objectContaining({ method: 'PATCH' })
      );
      expect(result).toEqual(mockResponse);
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
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/inspections/1/report/pdf`);
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('getReportHtml', () => {
    it('deve buscar o relatório HTML e retornar o conteúdo como texto', async () => {
      const inspectionId = 123;
      const mockHtml = '<html><body><h1>Relatório</h1></body></html>';
      const mockResponse = { ok: true, text: () => Promise.resolve(mockHtml) };
      (fetch as vi.Mock).mockResolvedValue(mockResponse as Response);
      const result = await apiService.getReportHtml(inspectionId);
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/inspections/${inspectionId}/report/html`);
      expect(result).toBe(mockHtml);
    });

    it('deve lançar um erro se a resposta da API não for bem-sucedida', async () => {
      const inspectionId = 404;
      const errorResponse = { ok: false, json: () => Promise.resolve({ message: 'Relatório não encontrado' }) };
      (fetch as vi.Mock).mockResolvedValue(errorResponse as Response);
      await expect(apiService.getReportHtml(inspectionId)).rejects.toThrow('Relatório não encontrado');
    });
  });
  
  describe('downloadEvidence', () => {
    it('deve baixar um arquivo de evidência e retornar um Blob', async () => {
      const mockBlob = new Blob(['conteudo-da-imagem']);
      (fetch as vi.Mock).mockReturnValue(Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response));
      const result = await apiService.downloadEvidence(1, 2, 'evidence.png');
      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/inspections/1/points/2/evidence/evidence.png`);
      expect(result).toBeInstanceOf(Blob);
    });

    it('deve lançar um erro se a resposta para baixar a evidência não for bem-sucedida', async () => {
      (fetch as vi.Mock).mockReturnValue(createFetchResponse(false, {}));
      await expect(apiService.downloadEvidence(1, 2, 'fail.png')).rejects.toThrow('Falha ao baixar a evidência: fail.png');
    });
  });
});