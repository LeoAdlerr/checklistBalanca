import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionController } from '../api/controllers/inspection.controller';
import { CreateInspectionUseCase } from '../domain/use-cases/create-inspection.use-case';
import { UpdateInspectionChecklistItemUseCase } from '../domain/use-cases/update-inspection-checklist-item.use-case';
import { UploadEvidenceUseCase } from '../domain/use-cases/upload-evidence.use-case';
import { FindAllInspectionsUseCase } from '../domain/use-cases/find-all-inspections.use-case';
import { FinalizeInspectionUseCase } from '../domain/use-cases/finalize-inspection.use-case';
import { FindInspectionByIdUseCase } from '../domain/use-cases/find-inspection-by-id.use-case';
import { InspectionRepositoryPort } from '../domain/repositories/inspection.repository.port';
import { InspectionRepository } from '../infra/typeorm/repositories/inspection.repository';
import { MasterInspectionPointRepositoryPort } from '../domain/repositories/master-inspection-point.repository.port';
import { MasterInspectionPointRepository } from '../infra/typeorm/repositories/master-inspection-point.repository';
import { FileSystemPort } from '../domain/ports/file-system.port';
import { FileSystemService } from '../infra/file-system/file-system.service';

// entidades
import { InspectionEntity } from '../infra/typeorm/entities/inspection.entity';
import { InspectionChecklistItemEntity } from '../infra/typeorm/entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from '../infra/typeorm/entities/item-evidence.entity';
import { MasterInspectionPointEntity } from '../infra/typeorm/entities/master-inspection-point.entity';
import { LookupChecklistItemStatusEntity } from '../infra/typeorm/entities/lookup-checklist-item-status.entity';
import { LookupModalityEntity } from '../infra/typeorm/entities/lookup-modality.entity';
import { LookupOperationTypeEntity } from '../infra/typeorm/entities/lookup-operation-type.entity';
import { LookupSealVerificationStatusEntity } from '../infra/typeorm/entities/lookup-seal-verification-status.entity';
import { LookupContainerTypeEntity } from '../infra/typeorm/entities/lookup-container-type.entity';
import { LookupUnitTypeEntity } from '../infra/typeorm/entities/lookup-unit-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspectionEntity,
      InspectionChecklistItemEntity,
      ItemEvidenceEntity,
      MasterInspectionPointEntity,
      LookupChecklistItemStatusEntity,
      LookupModalityEntity,
      LookupOperationTypeEntity,
      LookupSealVerificationStatusEntity,
      LookupContainerTypeEntity,
      LookupUnitTypeEntity
    ]),
  ],
  controllers: [InspectionController],
  providers: [
    CreateInspectionUseCase,
    UpdateInspectionChecklistItemUseCase,
    UploadEvidenceUseCase,
    FinalizeInspectionUseCase,
    FindAllInspectionsUseCase,
    FindInspectionByIdUseCase,
    {
      provide: InspectionRepositoryPort,
      useClass: InspectionRepository,
    },
    {
      provide: MasterInspectionPointRepositoryPort,
      useClass: MasterInspectionPointRepository,
    },
    {
      provide: FileSystemPort,
      useClass: FileSystemService,
    },
  ],
})
export class InspectionModule {}