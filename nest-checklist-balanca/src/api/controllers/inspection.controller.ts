import { Controller, Get, Post, Body, HttpCode, HttpStatus, Patch, Param, ParseIntPipe, UseInterceptors, UploadedFile, HttpException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger'; // ✅ Importe os decorators

import { CreateInspectionDto } from '../dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from '../dtos/update-inspection-checklist-item.dto';
import { CreateInspectionUseCase } from 'src/domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from 'src/domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from 'src/domain/use-cases/upload-evidence.use-case';
import { FinalizeInspectionUseCase } from 'src/domain/use-cases/finalize-inspection.use-case';
import { FindAllInspectionsUseCase } from 'src/domain/use-cases/find-all-inspections.use-case';
import { FindInspectionByIdUseCase } from 'src/domain/use-cases/find-inspection-by-id.use-case';
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';

@ApiTags('Inspections') // ✅ Agrupa todos os endpoints deste controller
@Controller('inspections')
export class InspectionController {
  constructor(
    private readonly createInspectionUseCase: CreateInspectionUseCase,
    private readonly updateItemUseCase: UpdateInspectionChecklistItemUseCase,
    private readonly uploadEvidenceUseCase: UploadEvidenceUseCase,
    private readonly finalizeInspectionUseCase: FinalizeInspectionUseCase,
    private readonly findAllInspectionsUseCase: FindAllInspectionsUseCase,
    private readonly findInspectionByIdUseCase: FindInspectionByIdUseCase,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Listar todas as inspeções' })
  @ApiResponse({ status: 200, description: 'Lista de inspeções retornada com sucesso.', type: [Inspection] })
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Inspection[]> {
    return this.findAllInspectionsUseCase.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma única inspeção por seu ID' })
  @ApiResponse({ status: 200, description: 'Inspeção encontrada com sucesso.', type: Inspection })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ParseIntPipe) id: number): Promise<Inspection> {
    try {
      return await this.findInspectionByIdUseCase.execute(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova inspeção' })
  @ApiResponse({ status: 201, description: 'A inspeção foi criada com sucesso.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInspectionDto: CreateInspectionDto): Promise<Inspection> {
    return this.createInspectionUseCase.execute(createInspectionDto);
  }

  @Patch(':inspectionId/points/:pointNumber')
  @ApiOperation({ summary: 'Atualizar o status e observações de um item do checklist' })
  @ApiResponse({ status: 200, description: 'Item do checklist atualizado com sucesso.', type: InspectionChecklistItem })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos ou status não permitido.' })
  @ApiResponse({ status: 404, description: 'Inspeção ou item não encontrado.' })
  @HttpCode(HttpStatus.OK)
  async updateItem(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @Body() updateDto: UpdateInspectionChecklistItemDto,
  ): Promise<InspectionChecklistItem> {
    return this.updateItemUseCase.execute(inspectionId, pointNumber, updateDto);
  }

  @ApiOperation({ summary: 'Anexar uma evidência (imagem) a um item do checklist' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de imagem para ser enviado (tamanho máximo: 5MB).',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Evidência anexada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Arquivo não enviado ou formato não suportado (apenas imagens).' })
  @Post(':inspectionId/points/:pointNumber/evidence')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/tmp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new HttpException('Apenas arquivos de imagem são permitidos!', HttpStatus.BAD_REQUEST), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadEvidence(
    @Param('inspectionId', ParseIntPipe) inspectionId: number,
    @Param('pointNumber', ParseIntPipe) pointNumber: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ItemEvidence> {
    if (!file) {
      throw new HttpException('Arquivo não enviado ou inválido.', HttpStatus.BAD_REQUEST);
    }
    return this.uploadEvidenceUseCase.execute(inspectionId, pointNumber, file);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalizar uma inspeção' })
  @ApiResponse({ status: 200, description: 'Inspeção finalizada com sucesso. O status será APROVADO ou REPROVADO.', type: Inspection })
  @ApiResponse({ status: 400, description: 'Não é possível finalizar, pois existem itens pendentes.' })
  @ApiResponse({ status: 404, description: 'Inspeção não encontrada.' })
  @HttpCode(HttpStatus.OK)
  async finalize(@Param('id', ParseIntPipe) id: number): Promise<Inspection> {
    return this.finalizeInspectionUseCase.execute(id);
  }
}
