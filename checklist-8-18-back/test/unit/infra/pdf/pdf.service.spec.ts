import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from '@infra/pdf/pdf.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import { InternalServerErrorException } from '@nestjs/common';

// Mock da biblioteca puppeteer
jest.mock('puppeteer', () => ({
  __esModule: true,
  default: {
    launch: jest.fn(),
  },
}));

describe('PdfService', () => {
  let service: PdfService;
  let module: TestingModule;
  
  // Declaramos os mocks aqui para que todos os testes no 'describe' os acessem
  let mockPage: { setContent: jest.Mock; pdf: jest.Mock; close: jest.Mock };
  let mockBrowser: { newPage: jest.Mock; close: jest.Mock };

  const puppeteerMock = puppeteer as jest.Mocked<typeof puppeteer>;

  beforeEach(async () => {
    jest.resetAllMocks();

    // Criamos os objetos mock com funções jest
    mockPage = {
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('test-pdf-content')),
      close: jest.fn().mockResolvedValue(undefined),
    };
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Configuramos o que o launch deve retornar
    (puppeteerMock.launch as jest.Mock).mockResolvedValue(mockBrowser as any);

    module = await Test.createTestingModule({
      providers: [PdfService],
    }).compile();

    await module.init();
    service = module.get<PdfService>(PdfService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve chamar puppeteer.launch na inicialização do módulo', () => {
    expect(puppeteer.launch).toHaveBeenCalledTimes(1);
  });

  it('deve gerar um PDF criando e fechando uma nova página', async () => {
    // Arrange
    const html = '<h1>Teste</h1>';

    // Act
    const resultBuffer = await service.generatePdfFromHtml(html);

    // Assert
    // Agora a asserção passa, pois apenas o serviço chamou newPage
    expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
    expect(mockPage.setContent).toHaveBeenCalledWith(html, { waitUntil: 'networkidle0' });
    expect(mockPage.pdf).toHaveBeenCalledTimes(1);
    expect(mockPage.close).toHaveBeenCalledTimes(1);
    expect(resultBuffer).toBeInstanceOf(Buffer);
  });

  it('deve chamar browser.close ao destruir o módulo (onModuleDestroy)', async () => {
    // Act
    await module.close();

    // Assert
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });
});