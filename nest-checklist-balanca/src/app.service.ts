import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LookupStatusEntity } from './infra/typeorm/entities/lookup-status.entity';

@Injectable()
export class AppService {
  constructor(
    // Injeta o repositório da nossa entidade de lookup de status.
    @InjectRepository(LookupStatusEntity)
    private readonly lookupStatusRepository: Repository<LookupStatusEntity>,
  ) {}

  async getHello(): Promise<any> {
    const apiStatus = 'UAGA Checklist API is running!';
    try {
      // Tenta fazer uma consulta simples para validar a conexão.
      const dbStatus = await this.lookupStatusRepository.find();
      return {
        status: apiStatus,
        database_connection: 'Success',
        // Retorna os status encontrados para confirmar que a leitura funciona.
        statuses_found: dbStatus.map(s => s.name),
      };
    } catch (error) {
      return {
        status: apiStatus,
        database_connection: 'Failed',
        error: error.message,
      };
    }
  }
}