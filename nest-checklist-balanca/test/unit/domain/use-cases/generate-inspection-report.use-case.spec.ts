import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GenerateInspectionReportUseCase } from '@domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from '@domain/use-cases/impl/generate-inspection-report.use-case.impl';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { PdfService } from '@infra/pdf/pdf.service';
import { Inspection } from '@domain/models/inspection.model';

// Mocks das dependências
const mockPdfService = {
  generatePdfFromHtml: jest.fn(),
};
const mockFindByIdUseCase = {
  execute: jest.fn(),
};

describe('GenerateInspectionReportUseCase', () => {
  let useCase: GenerateInspectionReportUseCase;
  let findByIdUseCase: FindInspectionByIdUseCase;
  let pdfService: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GenerateInspectionReportUseCase,
          useClass: GenerateInspectionReportUseCaseImpl,
        },
        { provide: FindInspectionByIdUseCase, useValue: mockFindByIdUseCase },
        { provide: PdfService, useValue: mockPdfService },
      ],
    }).compile();

    useCase = module.get<GenerateInspectionReportUseCase>(GenerateInspectionReportUseCase);
    findByIdUseCase = module.get<FindInspectionByIdUseCase>(FindInspectionByIdUseCase);
    pdfService = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.resetAllMocks(); // Limpa os mocks após cada teste
  });

  // Dados de mock reutilizáveis
  const mockInspection = {
    id: 1,
    inspectorName: 'Inspetor de Teste',
    driverName: 'Motorista de Teste',
    startDatetime: new Date(),
    items: [{ masterPointId: 1, statusId: 2 }], // Item concluído
  } as Inspection;

  const mockIncompleteInspection = {
    id: 2,
    items: [
      { masterPointId: 1, statusId: 2 },
      { masterPointId: 2, statusId: 1 }, // Item Pendente
    ],
  } as Inspection;

  describe('executePdf', () => {
    it('deve chamar o serviço de PDF e retornar um buffer em caso de sucesso', async () => {
      // Arrange
      const mockPdfBuffer = Buffer.from('conteudo-do-pdf');
      mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);
      mockPdfService.generatePdfFromHtml.mockResolvedValue(mockPdfBuffer);

      // Act
      const result = await useCase.executePdf(mockInspection.id);

      // Assert
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(mockInspection.id);
      expect(pdfService.generatePdfFromHtml).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockPdfBuffer);
    });

    it('deve lançar um BadRequestException se a inspeção tiver itens pendentes', async () => {
      // Arrange
      mockFindByIdUseCase.execute.mockResolvedValue(mockIncompleteInspection);

      // Act & Assert
      await expect(useCase.executePdf(mockIncompleteInspection.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('executeHtml', () => {
    it('deve retornar uma string HTML populada em caso de sucesso', async () => {
      // Arrange
      mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);

      // Act
      const result = await useCase.executeHtml(mockInspection.id);

      // Assert
      expect(findByIdUseCase.execute).toHaveBeenCalledWith(mockInspection.id);
      expect(pdfService.generatePdfFromHtml).not.toHaveBeenCalled();

      expect(typeof result).toBe('string');

      // Ajustamos a string para corresponder exatamente ao título no template
      expect(result).toContain('INSPEÇÃO 8/18 DE UNIDADE DE CARGA E TRANSPORTE');

      expect(result).toContain(mockInspection.inspectorName);
    });
  });
});