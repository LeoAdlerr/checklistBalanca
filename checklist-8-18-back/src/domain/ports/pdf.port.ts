export abstract class PdfPort {
  /**
   * Gera um arquivo PDF a partir de uma string HTML.
   * @param html - O conteúdo HTML a ser convertido.
   * @returns Uma Promise que resolve para um Buffer contendo o PDF.
   */
  abstract generatePdfFromHtml(html: string): Promise<Buffer>;
}