import { Inspection } from '../models/inspection.model';

export abstract class FinalizeInspectionUseCase {
  abstract execute(inspectionId: number): Promise<Inspection>;
}
