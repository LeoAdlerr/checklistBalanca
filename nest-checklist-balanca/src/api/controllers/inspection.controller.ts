import {
  Controller, Res, Delete, Get, Post, Body, HttpCode, HttpStatus,
  Patch, Param, ParseIntPipe, UseInterceptors, UploadedFile,
  HttpException, NotFoundException, Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

// pipes
import { EmptyBodyValidationPipe } from '../pipes/empty-body-validation.pipe';

// DTOs
import { CreateInspectionDto } from '../dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from '../dtos/update-inspection-checklist-item.dto';
import { UpdateInspectionDto } from '../dtos/update-inspection.dto';
import { DeleteEvidenceDto } from '../dtos/delete-evidence.dto';

// Use Cases
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from 'src/domain/use-cases/upload-evidence.use-case';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { FindAllInspectionsUseCase } from 'src/domain/use-cases/find-all-inspections.use-case';
import { FindInspectionByIdUseCase } from 'src/domain/use-cases/find-inspection-by-id.use-case';
import { GenerateInspectionReportUseCase } from 'src/domain/use-cases/generate-inspection-report.use-case';
import { CheckForExistingInspectionUseCase } from 'src/domain/use-cases/check-for-existing-inspection.use-case';
import { UpdateInspectionUseCase } from 'src/domain/use-cases/update-inspection.use-case';
import { DeleteInspectionUseCase } from 'src/domain/use-cases/delete-inspection.use-case';
import { DeleteEvidenceUseCase } from 'src/domain/use-cases/delete-evidence.use-case';

// Models
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionController {
  private readonly logger = new Logger(InspectionController.name);
  constructor(
    private readonly createInspectionUseCase: CreateInspectionUseCase,
    private readonly updateItemUseCase: UpdateInspectionChecklistItemUseCase,
    private readonly uploadEvidenceUseCase: UploadEvidenceUseCase,
    private readonly finalizeInspectionUseCase: FinalizeInspectionUseCase,
    private readonly findAllInspectionsUseCase: FindAllInspectionsUseCase,
    private readonly findInspectionByIdUseCase: FindInspectionByIdUseCase,
    private readonly generateReportUseCase: GenerateInspectionReportUseCase,
    private readonly checkForExistingUseCase: CheckForExistingInspectionUseCase,
    private readonly updateInspectionUseCase: UpdateInspectionUseCase,
    private readonly deleteInspectionUseCase: DeleteInspectionUseCase,
    private readonly deleteEvidenceUseCase: DeleteEvidenceUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as inspeções' })
  @ApiResponse({ status: 200, type: [Inspection] })
  async findAll(): Promise<Inspection[]> {
    return this.findAllInspectionsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma única inspeção por seu ID' })
  @ApiResponse({ status: 200, type: Inspection })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Inspection> {
    return this.findInspectionByIdUseCase.execute(id);
  }

  @Post('check-existing')
  @ApiOperation({ summary: 'Verifica se uma inspeção similar já existe' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async checkExisting(@Body() dto: CreateInspectionDto): Promise<Inspection> {
    const existingInspection = await this.checkForExistingUseCase.execute(dto);
    if (!existingInspection) {
      throw new NotFoundException('Nenhuma inspeção similar em andamento foi encontrada.');
    }
    return existingInspection;
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova inspeção' })
  @ApiResponse({ status: 201, type: Inspection })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInspectionDto: CreateInspectionDto): Promise<Inspection> {
    return this.createInspectionUseCase.execute(createInspectionDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os atributos de uma inspeção' })
  @ApiResponse({ status: 200, type: Inspection })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(EmptyBodyValidationPipe) dto: UpdateInspectionDto
  ): Promise<Inspection> {
    return this.updateInspectionUseCase.execute(id, dto);
  }

  @Patch(':inspectionId/points/:pointNumber')
  @ApiOperation({ summary: 'Atualizar o status e observações de um item do checklist' })
  @ApiResponse({ status: 200, type: InspectionChecklistItem })
  async updateItem(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Body() updateDto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem> {
    return this.updateItemUseCase.execute(inspectionId, pointNumber, updateDto);
  }

  @Post(':inspectionId/points/:pointNumber/evidence')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Anexar uma evidência (imagem) a um item do checklist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiResponse({ status: 201, type: ItemEvidence })
  async uploadEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    this.logger.debug({ message: 'Objeto FILE recebido no Controller', file });
    if (!file) {
      throw new HttpException('Arquivo não enviado ou o tipo não é suportado (apenas imagens).', HttpStatus.BAD_REQUEST);
    }
    return this.uploadEvidenceUseCase.execute(inspectionId, pointNumber, file);
  }

  @Delete(':inspectionId/points/:pointNumber/evidence')
  @ApiOperation({ summary: 'Apagar uma evidência (imagem) específica de um ponto' })
  @ApiResponse({ status: 200, description: 'Evidência apagada com sucesso.' })
  async deleteEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Body() dto: DeleteEvidenceDto,
  ): Promise<{ message: string }> {
    await this.deleteEvidenceUseCase.execute(inspectionId, pointNumber, dto.fileName);
    return { message: `Evidência "${dto.fileName}" apagada com sucesso.` };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Apagar uma inspeção (apenas se estiver "EM INSPEÇÃO")' })
  @ApiResponse({ status: 200, description: 'Inspeção apagada com sucesso.' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.deleteInspectionUseCase.execute(id);
    return { message: `Inspeção com ID ${id} apagada com sucesso.` };
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalizar uma inspeção' })
  @ApiResponse({ status: 200, type: Inspection })
  async finalize(@Param('id', ParseIntPipe) id: number): Promise<Inspection> {
    return this.finalizeInspectionUseCase.execute(id);
  }

  @Get(':id/report/pdf')
  @ApiOperation({ summary: 'Gerar e baixar o relatório de uma inspeção em PDF' })
  @ApiResponse({ status: 200 })
  async generateReport(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    const pdfBuffer = await this.generateReportUseCase.execute(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspecao-${id}.pdf"`);
    res.send(pdfBuffer);
  }
}