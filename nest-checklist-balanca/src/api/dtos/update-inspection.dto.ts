import { IsString, IsInt, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInspectionDto {

  @ApiPropertyOptional({
    description: 'Nome do inspetor que realiza a vistoria.',
    example: 'Leonardo Adler',
  })
  @IsString()
  @IsOptional()
  inspectorName?: string;

  @ApiPropertyOptional({
    description: 'Nome do motorista do veículo.',
    example: 'João da Silva',
  })
  @IsString()
  @IsOptional()
  driverName?: string;

  @ApiPropertyOptional({
    description: 'Número do registro de entrada.',
    example: 'RE2025/123456',
  })
  @IsString()
  @IsOptional()
  entryRegistration?: string;

  @ApiPropertyOptional({
    description: 'Placas do veículo.',
    example: 'BRA2E19',
  })
  @IsString()
  @IsOptional()
  vehiclePlates?: string;

  @ApiPropertyOptional({
    description: 'Número do documento de transporte (ex: CTe, AWB).',
    example: '987654321',
  })
  @IsString()
  @IsOptional()
  transportDocument?: string;

  @ApiPropertyOptional({
    description: 'ID da modalidade da inspeção. (1: RODOVIARIO, 2: MARITIMO, 3: AEREO)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  modalityId?: number;

  @ApiPropertyOptional({
    description: 'ID do tipo de operação. (1: VERDE, 2: LARANJA, 3: VERMELHA)',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  operationTypeId?: number;

  @ApiPropertyOptional({
    description: 'ID do tipo de unidade. (1: CONTAINER, 2: BAU)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  unitTypeId?: number;

  @ApiPropertyOptional({
    description: 'ID do tipo de contêiner. (1: DRY_20, 2: DRY_40, etc.)',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  containerTypeId?: number;

  @ApiPropertyOptional({
    description: 'Comprimento verificado na inspeção, em metros.',
    example: 12.02,
  })
  @IsNumber()
  @IsOptional()
  verifiedLength?: number;

  @ApiPropertyOptional({
    description: 'Largura verificada na inspeção, em metros.',
    example: 2.35,
  })
  @IsNumber()
  @IsOptional()
  verifiedWidth?: number;

  @ApiPropertyOptional({
    description: 'Altura verificada na inspeção, em metros.',
    example: 2.69,
  })
  @IsNumber()
  @IsOptional()
  verifiedHeight?: number;
}