import { Inspection } from '../models/inspection.model';

export abstract class FindInspectionByIdUseCase {
  abstract execute(id: number): Promise<Inspection>;
}