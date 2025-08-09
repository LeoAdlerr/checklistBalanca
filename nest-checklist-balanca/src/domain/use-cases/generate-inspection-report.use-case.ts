export abstract class GenerateInspectionReportUseCase {
  abstract executePdf(inspectionId: number): Promise<Buffer>;
  abstract executeHtml(inspectionId: number): Promise<string>;
}