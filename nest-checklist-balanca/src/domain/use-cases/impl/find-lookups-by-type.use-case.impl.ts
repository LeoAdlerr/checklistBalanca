import { Injectable } from '@nestjs/common';
import { Lookup } from '../../models/lookup.model';
import { LookupRepositoryPort, LookupType } from '../../repositories/lookup.repository.port';
import { FindLookupsByTypeUseCase } from '../find-lookups-by-type.use-case';

@Injectable()
export class FindLookupsByTypeUseCaseImpl implements FindLookupsByTypeUseCase {
  constructor(private readonly lookupRepository: LookupRepositoryPort) {}

  execute(type: LookupType): Promise<Lookup[]> {
    return this.lookupRepository.findByType(type);
  }
}