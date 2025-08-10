import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Module({
  providers: [PdfService],
  exports: [PdfService], // Exporte para que outros módulos possam usar
})
export class PdfModule {}