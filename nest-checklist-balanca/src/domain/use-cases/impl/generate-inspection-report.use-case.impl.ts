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

// --- TEMPLATE HTML do FORM. 24 ---
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Inspeção de Unidade de Carga</title>
    <style>
    body { font-family: Arial, sans-serif; font-size: 7pt; color: #333; } /* Reduced base font size slightly more */
    .page { 
        width: 210mm; 
        min-height: 297mm; 
        padding: 5mm; /* Reduced page padding */
        background-color: white; 
        box-sizing: border-box; 
    }
    table { width: 100%; border-collapse: collapse; margin-top: 3px; } /* Reduced table margin */
    th, td { border: 1px solid black; padding: 2px; text-align: left; vertical-align: top; } /* Reduced cell padding */
    th { background-color: #E0E0E0; text-align: center; font-weight: bold; }
    .header-title { text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 5px; } /* Reduced margin */
    .section-title { background-color: #333; color: white; text-align: center; font-weight: bold; padding: 2px; margin-top: 6px; } /* Reduced padding and margin */
    .header-table td, .sub-table td { padding: 2px; vertical-align: middle; }
    .field-label { font-weight: bold; }
    .checklist-table td:nth-child(1) { width: 55%; line-height: 1.1; } /* Added line-height to tighten text */
    .checklist-table td:nth-child(2), .checklist-table td:nth-child(3), .checklist-table td:nth-child(4) { width: 15%; text-align: center; font-weight: bold; font-size: 9pt; }
    .checkbox-placeholder { font-family: 'DejaVu Sans', sans-serif; }
    .signature-section { 
        margin-top: 15px; /* Significantly reduced margin */
        padding-top: 5px; 
        display: flex; 
        justify-content: space-around; 
        text-align: center; 
        page-break-inside: avoid; /* Crucial instruction to prevent breaking */
    }
    .signature-box { display: flex; flex-direction: column; align-items: center; }
    .signature-line { border-top: 1px solid black; width: 220px; margin-top: 25px; } /* Reduced margin */
    .signature-caption { font-size: 7pt; }
    .text-area { border: 1px solid black; min-height: 35px; padding: 3px; margin-top: 3px; word-wrap: break-word; } /* Reduced height, padding, and margin */
    .no-border-table, .no-border-table td { border: none; padding: 1px; } /* Reduced padding for the nested table */
</style>
</head>
<body>
<div class="page">
    <header>
        <div class="header-title">INSPEÇÃO 8/18 DE UNIDADE DE CARGA E TRANSPORTE</div>
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
            <thead><tr><th>Item / Descrição</th><th>Conforme</th><th>Não Conforme</th><th>N/A</th></tr></thead>
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

        <div class="section-title">Medidas e Lacres</div>
        <table class="sub-table">
            <tr>
                <td><span class="field-label">Comprimento (m):</span> {{comprimento_verificado}}</td>
                <td><span class="field-label">Largura (m):</span> {{largura_verificada}}</td>
                <td><span class="field-label">Altura (m):</span> {{altura_verificada}}</td>
            </tr>
             <tr>
                <td><span class="field-label">Lacre UAGA (Pós-Inspeção):</span> {{lacre_uaga_pos_inspecao}}</td>
                <td><span class="field-label">Lacre UAGA (Pós-Carregamento):</span> {{lacre_uaga_pos_carregamento}}</td>
                <td><span class="field-label">Lacre Armador:</span> {{lacre_armador}}</td>
            </tr>
            <tr>
                <td colspan="3"><span class="field-label">Lacre RFB:</span> {{lacre_rfb}}</td>
            </tr>
        </table>

        <div class="section-title">Verificação de Lacres de Saída</div>
        <table class="sub-table">
            <tr>
                <td><span class="field-label">Nome do Responsável:</span> {{verificacao_responsavel_nome}}</td>
                <td><span class="field-label">Data da Verificação:</span> {{verificacao_data}}</td>
            </tr>
            <tr>
                <td colspan="2">
                    <table class="no-border-table">
                        <tr>
                            <td><span class="field-label">Status Lacre RFB:</span></td>
                            <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 1}}}</span></td>
                            <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 2}}}</span></td>
                            <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_rfb_status 3}}}</span></td>
                        </tr>
                        <tr>
                            <td><span class="field-label">Status Lacre Armador:</span></td>
                            <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 1}}}</span></td>
                            <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 2}}}</span></td>
                            <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_shipper_status 3}}}</span></td>
                        </tr>
                        <tr>
                            <td><span class="field-label">Status Fita Lacre:</span></td>
                            <td>OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 1}}}</span></td>
                            <td>NÃO OK: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 2}}}</span></td>
                            <td>N/A: <span class="checkbox-placeholder">{{{ifChecked seal_tape_status 3}}}</span></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div class="section-title">Observações Finais</div>
        <table class="sub-table">
            <tr>
                <td><span class="field-label">Observações Gerais:</span><div class="text-area">{{observations}}</div></td>
                <td><span class="field-label">Providências Tomadas:</span><div class="text-area">{{action_taken}}</div></td>
            </tr>
        </table>
        
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-caption">{{nome_inspetor}}</div>
                <div class="signature-caption">Assinatura do Responsável pela Inspeção</div>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-caption">{{nome_motorista}}</div>
                <div class="signature-caption">Assinatura do Motorista</div>
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

    // Apenas o HTML
    async executeHtml(inspectionId: number): Promise<string> {
        this.logger.log(`Gerando HTML para a inspeção ID: ${inspectionId}`);
        return this.getPopulatedHtml(inspectionId);
    }

    // MÉTODO EXISTENTE para o PDF
    async executePdf(inspectionId: number): Promise<Buffer> {
        this.logger.log(`Gerando PDF para a inspeção ID: ${inspectionId}`);
        const populatedHtml = await this.getPopulatedHtml(inspectionId);
        return this.pdfService.generatePdfFromHtml(populatedHtml);
    }

    // LÓGICA COMPARTILHADA em um método privado para não repetir código
    private async getPopulatedHtml(inspectionId: number): Promise<string> {
        this.logger.log(`Buscando dados da inspeção ID: ${inspectionId} para o relatório.`);
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
        return template(context);
    }

    private registerHandlebarsHelpers(): void {
        Handlebars.registerHelper('ifChecked', function (statusId, expectedStatus) {
            return statusId === expectedStatus ? 'X' : '&nbsp;';
        });
    }

    private prepareTemplateContext(inspection: Inspection): object {
        const formatDate = (date: string | Date | null | undefined) =>
            date ? new Date(date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'N/A';

        return {
            data_hr_inicio: formatDate(inspection.startDatetime),
            data_hr_termino: formatDate(inspection.endDatetime),
            registro_entrada: inspection.entryRegistration || 'N/A',
            placas: inspection.vehiclePlates || 'N/A',
            n_transporte: inspection.transportDocument || 'N/A',
            modalidade: inspection.modality?.name || 'N/A',
            tipo_operacao: inspection.operationType?.name || 'N/A',
            tipo_unidade: inspection.unitType?.name || 'N/A',
            tipo_container: inspection.containerType?.name || 'N/A',
            comprimento_verificado: inspection.verifiedLength ?? 'N/A',
            largura_verificada: inspection.verifiedWidth ?? 'N/A',
            altura_verificada: inspection.verifiedHeight ?? 'N/A',
            lacre_uaga_pos_inspecao: inspection.sealUagaPostInspection || 'N/A',
            lacre_uaga_pos_carregamento: inspection.sealUagaPostLoading || 'N/A',
            lacre_armador: inspection.sealShipper || 'N/A',
            lacre_rfb: inspection.sealRfb || 'N/A',
            verificacao_responsavel_nome: inspection.sealVerificationResponsibleName || 'N/A',
            verificacao_data: inspection.sealVerificationDate
                ? new Date(`${inspection.sealVerificationDate}T00:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                : 'N/A',
            items: inspection.items,
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