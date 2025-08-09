import { Module, HttpException, HttpStatus } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdfModule } from '../infra/pdf/pdf.module';
import { InspectionController } from '../api/controllers/inspection.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';

// pipes
import { EmptyBodyValidationPipe } from '../api/pipes/empty-body-validation.pipe';

// Importação do novo módulo centralizado
import { FileSystemModule } from '../infra/file-system/file-system.module';

// Use Cases (Interfaces e Implementações)
import { CreateInspectionUseCase } from '../domain/use-cases/create-inspection.use-case';
import { CreateInspectionUseCaseImpl } from '../domain/use-cases/impl/create-inspection.use-case.impl';
import { UpdateInspectionChecklistItemUseCase } from '../domain/use-cases/update-inspection-checklist-item.use-case';
import { UpdateInspectionChecklistItemUseCaseImpl } from '../domain/use-cases/impl/update-inspection-checklist-item.use-case.impl';
import { UploadEvidenceUseCase } from '../domain/use-cases/upload-evidence.use-case';
import { UploadEvidenceUseCaseImpl } from '../domain/use-cases/impl/upload-evidence.use-case.impl';
import { FinalizeInspectionUseCase } from '../domain/use-cases/finalize-inspection.use-case';
import { FinalizeInspectionUseCaseImpl } from '../domain/use-cases/impl/finalize-inspection.use-case.impl';
import { FindAllInspectionsUseCase } from '../domain/use-cases/find-all-inspections.use-case';
import { FindAllInspectionsUseCaseImpl } from '../domain/use-cases/impl/find-all-inspections.use-case.impl';
import { FindInspectionByIdUseCase } from '../domain/use-cases/find-inspection-by-id.use-case';
import { FindInspectionByIdUseCaseImpl } from '../domain/use-cases/impl/find-inspection-by-id.use-case.impl';
import { GenerateInspectionReportUseCase } from '../domain/use-cases/generate-inspection-report.use-case';
import { GenerateInspectionReportUseCaseImpl } from '../domain/use-cases/impl/generate-inspection-report.use-case.impl';
import { CheckForExistingInspectionUseCase } from '../domain/use-cases/check-for-existing-inspection.use-case';
import { CheckForExistingInspectionUseCaseImpl } from '../domain/use-cases/impl/check-for-existing-inspection.use-case.impl';
import { UpdateInspectionUseCase } from '../domain/use-cases/update-inspection.use-case';
import { UpdateInspectionUseCaseImpl } from '../domain/use-cases/impl/update-inspection.use-case.impl';
import { DeleteInspectionUseCase } from '../domain/use-cases/delete-inspection.use-case';
import { DeleteInspectionUseCaseImpl } from '../domain/use-cases/impl/delete-inspection.use-case.impl';
import { DeleteEvidenceUseCase } from '../domain/use-cases/delete-evidence.use-case';
import { DeleteEvidenceUseCaseImpl } from '../domain/use-cases/impl/delete-evidence.use-case.impl';
import { DownloadEvidenceUseCase } from '@domain/use-cases/download-evidence.use-case';
import { DownloadEvidenceUseCaseImpl } from '@domain/use-cases/impl/download-evidence.use-case.impl';


// Ports e Repositories
import { InspectionRepositoryPort } from '../domain/repositories/inspection.repository.port';
import { InspectionRepository } from '../infra/typeorm/repositories/inspection.repository';
import { MasterInspectionPointRepositoryPort } from '../domain/repositories/master-inspection-point.repository.port';
import { MasterInspectionPointRepository } from '../infra/typeorm/repositories/master-inspection-point.repository';
import { FileSystemPort } from '../domain/ports/file-system.port';

// Entidades do TypeORM
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
import { LookupStatusEntity } from '../infra/typeorm/entities/lookup-status.entity';

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
      LookupUnitTypeEntity,
      LookupStatusEntity,
    ]),
    PdfModule,
    //  Importamos o FileSystemModule para ter acesso aos seus providers exportados
    FileSystemModule,
    MulterModule.registerAsync({
      // A injeção de dependência é explícita
      imports: [FileSystemModule],
      useFactory: async (fsService: FileSystemPort) => {
        const tempDir = path.join(process.cwd(), 'uploads', 'tmp');
        await fsService.createDirectoryIfNotExists(tempDir);
        return {
          dest: tempDir,
          fileFilter: (req, file, cb) => {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
              cb(null, true);
            } else {
              cb(null, false);
            }
          },
          limits: { fileSize: 5 * 1024 * 1024 },
        };
      },
      inject: [FileSystemPort],
    }),
  ],
  controllers: [InspectionController],
  providers: [
    { provide: CreateInspectionUseCase, useClass: CreateInspectionUseCaseImpl },
    { provide: UpdateInspectionChecklistItemUseCase, useClass: UpdateInspectionChecklistItemUseCaseImpl },
    { provide: UploadEvidenceUseCase, useClass: UploadEvidenceUseCaseImpl },
    { provide: FinalizeInspectionUseCase, useClass: FinalizeInspectionUseCaseImpl },
    { provide: FindAllInspectionsUseCase, useClass: FindAllInspectionsUseCaseImpl },
    { provide: FindInspectionByIdUseCase, useClass: FindInspectionByIdUseCaseImpl },
    { provide: GenerateInspectionReportUseCase, useClass: GenerateInspectionReportUseCaseImpl },
    { provide: CheckForExistingInspectionUseCase, useClass: CheckForExistingInspectionUseCaseImpl },
    { provide: InspectionRepositoryPort, useClass: InspectionRepository },
    { provide: MasterInspectionPointRepositoryPort, useClass: MasterInspectionPointRepository },
    { provide: UpdateInspectionUseCase, useClass: UpdateInspectionUseCaseImpl },
    { provide: DeleteInspectionUseCase, useClass: DeleteInspectionUseCaseImpl },
    { provide: DeleteEvidenceUseCase, useClass: DeleteEvidenceUseCaseImpl },
    { provide: DownloadEvidenceUseCase, useClass: DownloadEvidenceUseCaseImpl },
    EmptyBodyValidationPipe,
  ],
})
export class InspectionModule { }