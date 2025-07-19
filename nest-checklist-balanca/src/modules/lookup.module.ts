import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LookupController } from '../api/controllers/lookup.controller';
import { FindLookupsByTypeUseCase } from '../domain/use-cases/find-lookups-by-type.use-case';
import { FindLookupsByTypeUseCaseImpl } from '../domain/use-cases/impl/find-lookups-by-type.use-case.impl';
import { LookupRepositoryPort } from '../domain/repositories/lookup.repository.port';
import { LookupRepository } from '../infra/typeorm/repositories/lookup.repository';

// Importe TODAS as suas entidades de lookup
import { LookupStatusEntity } from '../infra/typeorm/entities/lookup-status.entity';
import { LookupModalityEntity } from '../infra/typeorm/entities/lookup-modality.entity';
import { LookupOperationTypeEntity } from '../infra/typeorm/entities/lookup-operation-type.entity';
import { LookupUnitTypeEntity } from '../infra/typeorm/entities/lookup-unit-type.entity';
import { LookupContainerTypeEntity } from '../infra/typeorm/entities/lookup-container-type.entity';
import { LookupChecklistItemStatusEntity } from '../infra/typeorm/entities/lookup-checklist-item-status.entity';
import { LookupSealVerificationStatusEntity } from '../infra/typeorm/entities/lookup-seal-verification-status.entity';

@Module({
  imports: [
    // Disponibiliza todos os repositórios de lookup para injeção no LookupRepository
    TypeOrmModule.forFeature([
      LookupStatusEntity,
      LookupModalityEntity,
      LookupOperationTypeEntity,
      LookupUnitTypeEntity,
      LookupContainerTypeEntity,
      LookupChecklistItemStatusEntity,
      LookupSealVerificationStatusEntity,
    ]),
  ],
  controllers: [LookupController],
  providers: [
    {
      provide: FindLookupsByTypeUseCase,
      useClass: FindLookupsByTypeUseCaseImpl,
    },
    {
      provide: LookupRepositoryPort,
      useClass: LookupRepository,
    },
  ],
})
export class LookupModule {}