import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GenerateInspectionReportUseCase } from '@domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from '@domain/use-cases/impl/generate-inspection-report.use-case.impl';
import { FindInspectionByIdUseCase } from '@domain/use-cases/find-inspection-by-id.use-case';
import { PdfService } from '@infra/pdf/pdf.service';
import { Inspection } from '@domain/models/inspection.model';

// Os mocks das dependências continuam os mesmos
const mockPdfService = {
  generatePdfFromHtml: jest.fn(),
};
const mockFindByIdUseCase = {
  execute: jest.fn(),
};

describe('GenerateInspectionReportUseCase', () => {
  let useCase: GenerateInspectionReportUseCase;
  let pdfService: PdfService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Mapeia a interface (provide) para a implementação (useClass)
        {
          provide: GenerateInspectionReportUseCase,
          useClass: GenerateInspectionReportUseCaseImpl,
        },
        { provide: FindInspectionByIdUseCase, useValue: mockFindByIdUseCase },
        { provide: PdfService, useValue: mockPdfService },
      ],
    }).compile();

    useCase = module.get<GenerateInspectionReportUseCase>(GenerateInspectionReportUseCase);
    pdfService = module.get<PdfService>(PdfService);
  });

  afterEach(() => {
    jest.resetAllMocks(); // Garante isolamento total entre os testes
  });

  it('deve gerar um relatório em PDF com sucesso', async () => {
    // Arrange
    const inspectionId = 1;
    const mockInspection = {
      id: inspectionId,
      inspectorName: 'Teste',
      driverName: 'Motorista de Teste',
      statusId: 2, // Finalizado
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
      startDatetime: new Date(),
      items: [{ masterPointId: 1, statusId: 2 }], // Item concluído
    } as Inspection;

    const mockPdfBuffer = Buffer.from('conteudo-do-pdf');
    mockFindByIdUseCase.execute.mockResolvedValue(mockInspection);
    mockPdfService.generatePdfFromHtml.mockResolvedValue(mockPdfBuffer);

    // Act
    const result = await useCase.execute(inspectionId);

    // Assert
    expect(mockPdfService.generatePdfFromHtml).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockPdfBuffer);
  });

  it('deve lançar um BadRequestException se a inspeção tiver itens pendentes', async () => {
    // Arrange
    const inspectionId = 2;
    const mockIncompleteInspection = {
      id: inspectionId,
      items: [
        { masterPointId: 1, statusId: 2 },
        { masterPointId: 2, statusId: 1 }, // Pendente
      ],
    } as Inspection;
    mockFindByIdUseCase.execute.mockResolvedValue(mockIncompleteInspection);

    // Act & Assert
    await expect(useCase.execute(inspectionId)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute(inspectionId)).rejects.toThrow(
      'Não é possível gerar o relatório. Pontos pendentes: 2.',
    );
  });
});