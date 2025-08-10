import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterInspectionPointRepositoryPort } from 'src/domain/repositories/master-inspection-point.repository.port';
import { MasterInspectionPoint } from 'src/domain/models/master-inspection-point.model';
import { MasterInspectionPointEntity } from '../entities/master-inspection-point.entity';

@Injectable()
export class MasterInspectionPointRepository implements MasterInspectionPointRepositoryPort {
  constructor(
    @InjectRepository(MasterInspectionPointEntity)
    private readonly typeormRepo: Repository<MasterInspectionPointEntity>,
  ) {}

  async findAll(): Promise<MasterInspectionPoint[]> {
    return this.typeormRepo.find();
  }
}