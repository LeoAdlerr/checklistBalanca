import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // ✅ Importe

export class CreateInspectionDto {
  @ApiProperty({
    description: 'Nome do inspetor que realiza a vistoria.',
    example: 'Leonardo Adler',
  })
  @IsString()
  @IsNotEmpty()
  inspectorName: string;

  @ApiProperty({
    description: 'Número do registro de entrada (opcional).',
    example: 'RE2025/123456',
    required: false, // Deixa claro na documentação que não é obrigatório
  })
  @IsString()
  @IsOptional()
  entryRegistration?: string;

  @ApiProperty({
    description: 'Placas do veículo (opcional).',
    example: 'BRA2E19',
    required: false,
  })
  @IsString()
  @IsOptional()
  vehiclePlates?: string;

  @ApiProperty({
    description: 'ID da modalidade da inspeção. (1: RODOVIARIO, 2: MARITIMO, 3: AEREO)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  modalityId: number;

  @ApiProperty({
    description: 'ID do tipo de operação. (1: VERDE, 2: LARANJA, 3: VERMELHA)',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  operationTypeId: number;

  @ApiProperty({
    description: 'ID do tipo de unidade. (1: CONTAINER, 2: BAU)',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  unitTypeId: number;

  @ApiProperty({
    description: 'ID do tipo de contêiner. (1: DRY_20, 2: DRY_40, etc.)',
    example: 2,
    required: false,
  })
  @IsInt()
  @IsOptional()
  containerTypeId?: number;

  @ApiProperty({
    description: 'Nome do motorista do veículo.',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  driverName: string;
}