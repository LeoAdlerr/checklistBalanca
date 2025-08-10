import { Inspection } from '../models/inspection.model';

export abstract class FindAllInspectionsUseCase {
  abstract execute(): Promise<Inspection[]>;
}