import { ItemEvidence } from '../models/item-evidence.model';

export abstract class UploadEvidenceUseCase {
  abstract execute(
    inspectionId: number,
    pointNumber: number,
    file: Express.Multer.File,
  ): Promise<ItemEvidence>;
}