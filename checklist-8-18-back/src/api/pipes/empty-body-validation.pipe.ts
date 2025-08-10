import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class EmptyBodyValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Este pipe só deve atuar sobre o 'body' da requisição
    if (metadata.type !== 'body') {
      return value;
    }

    // A validação robusta: verifica se o valor é nulo, indefinido,
    // ou um objeto sem nenhuma chave própria.
    if (value == null || (typeof value === 'object' && Object.keys(value).length === 0)) {
      throw new BadRequestException('O corpo da requisição (body) não pode estar vazio.');
    }
    
    return value;
  }
}