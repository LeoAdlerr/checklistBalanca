import { IsString, IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // ✅ Importe

export class UpdateInspectionChecklistItemDto {
  @ApiProperty({
    description: 'ID do novo status do item. Valores permitidos: 2 (CONFORME), 3 (NAO_CONFORME), 4 (N_A).',
    example: 2,
  })
  @IsInt()
  @IsIn([2, 3, 4])
  statusId: number;

  @ApiProperty({
    description: 'Observações sobre o item inspecionado (opcional, mas recomendado para status NAO_CONFORME).',
    example: 'Pequena avaria na lateral esquerda, necessita de reparo.',
    required: false,
  })
  @IsString()
  @IsOptional()
  observations?: string;
}