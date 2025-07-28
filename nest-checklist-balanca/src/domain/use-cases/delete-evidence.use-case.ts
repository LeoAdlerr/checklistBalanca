export abstract class DeleteEvidenceUseCase {
  abstract execute(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<void>;
}