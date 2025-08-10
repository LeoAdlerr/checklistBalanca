import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteEvidenceDto {
  @ApiProperty({
    description: 'O nome exato do ficheiro a ser apagado.',
    example: 'running1.jpeg',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}