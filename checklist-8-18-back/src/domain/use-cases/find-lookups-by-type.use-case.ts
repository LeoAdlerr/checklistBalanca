import { Lookup } from '../models/lookup.model';
import { LookupType } from '../repositories/lookup.repository.port';

export abstract class FindLookupsByTypeUseCase {
  abstract execute(type: LookupType): Promise<Lookup[]>;
}