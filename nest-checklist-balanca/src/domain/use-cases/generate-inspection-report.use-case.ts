export abstract class GenerateInspectionReportUseCase {
  abstract execute(inspectionId: number): Promise<Buffer>;
}