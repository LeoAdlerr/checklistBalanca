import { Lookup } from '../models/lookup.model';

// Definimos os tipos de lookup permitidos para garantir a segurança
export type LookupType = 
  | 'statuses' 
  | 'modalities' 
  | 'operation-types' 
  | 'unit-types' 
  | 'container-types' 
  | 'checklist-item-statuses' 
  | 'seal-verification-statuses';

export abstract class LookupRepositoryPort {
  abstract findByType(type: LookupType): Promise<Lookup[]>;
}