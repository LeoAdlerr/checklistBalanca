import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FindLookupsByTypeUseCase } from 'src/domain/use-cases/find-lookups-by-type.use-case';
import { LookupType } from 'src/domain/repositories/lookup.repository.port';

@ApiTags('Lookups')
@Controller('lookups')
export class LookupController {
  constructor(private readonly findLookupsUseCase: FindLookupsByTypeUseCase) {}

  @Get(':type')
  @ApiOperation({ summary: 'Buscar uma lista de valores de lookup por tipo' })
  @ApiParam({ name: 'type', description: 'O tipo de lookup a ser buscado', enum: ['statuses', 'modalities', 'operation-types', 'unit-types', 'container-types', 'checklist-item-statuses', 'seal-verification-statuses']})
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Tipo de lookup inválido.' })
  findAllByType(@Param('type') type: LookupType) {
    return this.findLookupsUseCase.execute(type);
  }
}