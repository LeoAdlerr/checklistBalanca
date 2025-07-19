import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

// ENTIDADES
import { InspectionEntity } from './entities/inspection.entity';
import { InspectionChecklistItemEntity } from './entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from './entities/item-evidence.entity';
import { MasterInspectionPointEntity } from './entities/master-inspection-point.entity';
import { LookupChecklistItemStatusEntity } from './entities/lookup-checklist-item-status.entity';
import { LookupModalityEntity } from './entities/lookup-modality.entity';
import { LookupOperationTypeEntity } from './entities/lookup-operation-type.entity';
import { LookupSealVerificationStatusEntity } from './entities/lookup-seal-verification-status.entity';
import { LookupContainerTypeEntity } from './entities/lookup-container-type.entity';
import { LookupUnitTypeEntity } from './entities/lookup-unit-type.entity';
import { LookupStatusEntity } from './entities/lookup-status.entity';

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('db');
    return {
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,

      entities: [
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
        LookupStatusEntity
      ],

      synchronize: dbConfig.synchronize,

      logging: ['error'],
    };
  }
}