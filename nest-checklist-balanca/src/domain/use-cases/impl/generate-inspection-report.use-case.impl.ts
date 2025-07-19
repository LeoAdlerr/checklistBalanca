import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { GenerateInspectionReportUseCase } from '../generate-inspection-report.use-case';
import { FindInspectionByIdUseCase } from '../find-inspection-by-id.use-case';
import { PdfService } from '../../../infra/pdf/pdf.service';
import { Inspection } from '../../models/inspection.model';
import * as Handlebars from 'handlebars';

// TEMPLATE HTML COMPLETO
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Inspeção de Unidade de Carga</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 8pt; color: #333; }
        .page { width: 210mm; min-height: 297mm; padding: 8mm; background-color: white; box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        th, td { border: 1px solid black; padding: 3px; text-align: left; vertical-align: top; }
        th { background-color: #E0E0E0; text-align: center; font-weight: bold; }
        .header-title { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 10px; }
        .section-title { background-color: #333; color: white; text-align: center; font-weight: bold; padding: 4px; margin-top: 10px; }
        .header-table td { padding: 4px; vertical-align: middle; }
        .header-table .field-label { font-weight: bold; }
        .checklist-table td:nth-child(1) { width: 55%; }
        .checklist-table td:nth-child(2), .checklist-table td:nth-child(3), .checklist-table td:nth-child(4) { width: 15%; text-align: center; font-weight: bold; font-size: 10pt; }
        .checkbox-placeholder { font-family: 'DejaVu Sans', sans-serif; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-around; text-align: center; }
        .signature-box { display: flex; flex-direction: column; align-items: center; }
        .signature-line { border-top: 1px solid black; width: 250px; height: 40px; margin-bottom: 5px; }
        .signature-caption { font-size: 7pt; }
        .text-area { border: 1px solid black; min-height: 50px; padding: 5px; margin-top: 5px; }
    </style>
</head>
<body>
<div class="page">
    <header>
        <div class="header-title">INSPEÇÃO DE UNIDADE DE CARGA E TRANSPORTE</div>
        <table class="header-table">
            <tr>
                <td><span class="field-label">DATA/HR INÍCIO:</span> {{data_hr_inicio}}</td>
                <td><span class="field-label">DATA/HR TÉRMINO:</span> {{data_hr_termino}}</td>
                <td><span class="field-label">REGISTRO DE ENTRADA:</span> {{registro_entrada}}</td>
            </tr>
            <tr>
                <td><span class="field-label">PLACAS:</span> {{placas}}</td>
                <td><span class="field-label">N° TRANSPORTE:</span> {{n_transporte}}</td>
                <td><span class="field-label">MODALIDADE:</span> {{modalidade}}</td>
            </tr>
            <tr>
                <td><span class="field-label">OPERAÇÃO:</span> {{tipo_operacao}}</td>
                <td><span class="field-label">TIPO UNIDADE:</span> {{tipo_unidade}}</td>
                <td><span class="field-label">TIPO CONTÊINER:</span> {{tipo_container}}</td>
            </tr>
        </table>
    </header>
    <main>
        <div class="section-title">CHECKLIST DE INSPEÇÃO 8/18 PONTOS</div>
        <table class="checklist-table">
            <thead>
                <tr><th>Item / Descrição</th><th>Conforme</th><th>Não Conforme</th><th>N/A</th></tr>
            </thead>
            <tbody>
                {{#each items}}
                <tr>
                    <td><b>{{this.masterPoint.pointNumber}}. {{this.masterPoint.name}}</b><br><small>{{this.masterPoint.description}}</small></td>
                    <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 2}}}</div></td>
                    <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 3}}}</div></td>
                    <td><div class="checkbox-placeholder">{{{ifChecked this.statusId 4}}}</div></td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <div class="section-title">OBSERVAÇÕES GERAIS</div>
        <div class="text-area">{{observations}}</div>
        
        <div class="section-title">PROVIDÊNCIAS TOMADAS</div>
        <div class="text-area">{{action_taken}}</div>
        
        <div class="section-title">VERIFICAÇÃO DE LACRES DE SAÍDA</div>
        <table>
            <tr>
                <td><span class="field-label">Lacre RFB:</span></td>
                <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 1}}}</span></td>
                <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 2}}}</span></td>
                <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 3}}}</span></td>
            </tr>
            <tr>
                <td><span class="field-label">Lacre Armador (Pós Unitização):</span></td>
                <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 1}}}</span></td>
                <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 2}}}</span></td>
                <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 3}}}</span></td>
            </tr>
             <tr>
                <td><span class="field-label">Fita Lacre UAGA:</span></td>
                <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 1}}}</span></td>
                <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 2}}}</span></td>
                <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 3}}}</span></td>
            </tr>
        </table>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-caption">{{nome_inspetor}}</div>
                <div class="signature-caption">Nome do Responsável pela Inspeção</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-caption">{{nome_motorista}}</div>
                <div class="signature-caption">Assinatura Motorista</div>
            </div>
        </div>
    </main>
</div>
</body>
</html>
`;

@Injectable()
export class GenerateInspectionReportUseCaseImpl implements GenerateInspectionReportUseCase {
  private readonly logger = new Logger(GenerateInspectionReportUseCaseImpl.name);

  constructor(
    private readonly findInspectionByIdUseCase: FindInspectionByIdUseCase,
    private readonly pdfService: PdfService,
  ) {
    this.registerHandlebarsHelpers();
  }

  async execute(inspectionId: number): Promise<Buffer> {
    this.logger.log(`Buscando dados da inspeção ID: ${inspectionId}`);
    const inspection = await this.findInspectionByIdUseCase.execute(inspectionId);

    if (!inspection.items?.length) {
      throw new InternalServerErrorException('Falha ao carregar itens da inspeção.');
    }

    const pendingItems = inspection.items.filter(item => item.statusId === 1);
    if (pendingItems.length > 0) {
      const pendingPointNumbers = pendingItems.map(item => item.masterPointId).join(', ');
      throw new BadRequestException(`Não é possível gerar o relatório. Pontos pendentes: ${pendingPointNumbers}.`);
    }

    const template = Handlebars.compile(HTML_TEMPLATE);
    const context = this.prepareTemplateContext(inspection);
    const populatedHtml = template(context);

    this.logger.log('Chamando o serviço de PDF...');
    return this.pdfService.generatePdfFromHtml(populatedHtml);
  }

  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('ifChecked', function (statusId, expectedStatus) {
      return statusId === expectedStatus ? 'X' : '&nbsp;';
    });

    Handlebars.registerHelper('formatDate', function (date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    });
  }

  private prepareTemplateContext(inspection: Inspection): object {
    return {
      data_hr_inicio: new Date(inspection.startDatetime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      data_hr_termino: inspection.endDatetime
        ? new Date(inspection.endDatetime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : 'N/A',
      registro_entrada: inspection.entryRegistration || 'N/A',
      placas: inspection.vehiclePlates || 'N/A',
      n_transporte: inspection.transportDocument || 'N/A',
      modalidade: inspection.modality?.name || 'N/A',
      tipo_operacao: inspection.operationType?.name || 'N/A',
      tipo_unidade: inspection.unitType?.name || 'N/A',
      tipo_container: inspection.containerType?.name || 'N/A',
      comprimento_verificado: inspection.verifiedLength || 'N/A',
      largura_verificada: inspection.verifiedWidth || 'N/A',
      altura_verificada: inspection.verifiedHeight || 'N/A',
      items: inspection.items.map(item => ({
        ...item,
        observations: item.observations || '',
      })),
      observations: inspection.observations || 'Nenhuma observação geral.',
      action_taken: inspection.actionTaken || 'Nenhuma providência tomada.',
      seal_rfb_status: inspection.sealVerificationRfbStatusId,
      seal_shipper_status: inspection.sealVerificationShipperStatusId,
      seal_tape_status: inspection.sealVerificationTapeStatusId,
      nome_inspetor: inspection.inspectorName,
      nome_motorista: inspection.driverName,
    };
  }
}