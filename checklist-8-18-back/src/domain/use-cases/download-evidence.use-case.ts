import { ItemEvidence } from '../models/item-evidence.model';

// Definimos um tipo para a resposta, para ficar mais claro
export interface DownloadedEvidence {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}

export abstract class DownloadEvidenceUseCase {
  abstract execute(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<DownloadedEvidence>;
}