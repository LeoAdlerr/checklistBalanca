import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lookup } from 'src/domain/models/lookup.model';
import { LookupRepositoryPort, LookupType } from 'src/domain/repositories/lookup.repository.port';

// Importa as suas entidades de lookup
import { LookupStatusEntity } from '../entities/lookup-status.entity';
import { LookupModalityEntity } from '../entities/lookup-modality.entity';
import { LookupOperationTypeEntity } from '../entities/lookup-operation-type.entity';
import { LookupUnitTypeEntity } from '../entities/lookup-unit-type.entity';
import { LookupContainerTypeEntity } from '../entities/lookup-container-type.entity';
import { LookupChecklistItemStatusEntity } from '../entities/lookup-checklist-item-status.entity';
import { LookupSealVerificationStatusEntity } from '../entities/lookup-seal-verification-status.entity';

@Injectable()
export class LookupRepository implements LookupRepositoryPort {
  // Criamos um mapa que associa a string do tipo ao repositório correto
  private readonly repositoryMap: Map<LookupType, Repository<Lookup>>;

  constructor(
    @InjectRepository(LookupStatusEntity) private readonly statusRepo: Repository<LookupStatusEntity>,
    @InjectRepository(LookupModalityEntity) private readonly modalityRepo: Repository<LookupModalityEntity>,
    @InjectRepository(LookupOperationTypeEntity) private readonly operationTypeRepo: Repository<LookupOperationTypeEntity>,
    @InjectRepository(LookupUnitTypeEntity) private readonly unitTypeRepo: Repository<LookupUnitTypeEntity>,
    @InjectRepository(LookupContainerTypeEntity) private readonly containerTypeRepo: Repository<LookupContainerTypeEntity>,
    @InjectRepository(LookupChecklistItemStatusEntity) private readonly checklistItemStatusRepo: Repository<LookupChecklistItemStatusEntity>,
    @InjectRepository(LookupSealVerificationStatusEntity) private readonly sealStatusRepo: Repository<LookupSealVerificationStatusEntity>,
  ) {
    this.repositoryMap = new Map([
      ['statuses', this.statusRepo as Repository<Lookup>],
      ['modalities', this.modalityRepo as Repository<Lookup>],
      ['operation-types', this.operationTypeRepo as Repository<Lookup>],
      ['unit-types', this.unitTypeRepo as Repository<Lookup>],
      ['container-types', this.containerTypeRepo as Repository<Lookup>],
      ['checklist-item-statuses', this.checklistItemStatusRepo as Repository<Lookup>],
      ['seal-verification-statuses', this.sealStatusRepo as Repository<Lookup>],
    ]);
  }

  async findByType(type: LookupType): Promise<Lookup[]> {
    const repository = this.repositoryMap.get(type);
    if (!repository) {
      throw new BadRequestException(`Tipo de lookup inválido: ${type}`);
    }
    // Busca todos os registros do tipo e ordena por ID
    return repository.find({ order: { id: 'ASC' } });
  }
}