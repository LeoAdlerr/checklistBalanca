import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
  OnModuleDestroy
} from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { PdfPort } from '../../domain/ports/pdf.port';

@Injectable()
export class PdfService implements PdfPort, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browser: Browser | null = null; // Instância do browser será compartilhada

  /**
   *  Este método é chamado pelo NestJS uma única vez, quando o módulo é iniciado.
   */
  async onModuleInit() {
    this.logger.log('Iniciando instância compartilhada do Puppeteer...');
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
      });
      this.logger.log('Instância do Puppeteer iniciada com sucesso.');
    } catch (error) {
      this.logger.error('Falha ao iniciar o Puppeteer na inicialização do módulo.', error);
    }
  }

  /**
   *  Este método é chamado pelo NestJS quando a aplicação está sendo encerrada.
   */
  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Fechando a instância compartilhada do Puppeteer...');
      await this.browser.close();
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    if (!this.browser) {
      this.logger.error('A instância do Puppeteer não está disponível.');
      throw new InternalServerErrorException('Serviço de PDF não está disponível no momento.');
    }

    let page: Page | null = null;
    try {
      page = await this.browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
      });

      return Buffer.from(pdfUint8Array);
    } catch (error) {
      this.logger.error('Erro durante a geração do PDF com Puppeteer', error);
      throw new InternalServerErrorException('Falha ao gerar o relatório em PDF.');

    } finally {
      // Fechamos a PÁGINA
      if (page) {
        await page.close();
      }
    }
  }
}