export abstract class DeleteInspectionUseCase {
  /**
   * Apaga uma inspeção completa, incluindo registos e ficheiros associados.
   * @param id O ID da inspeção a ser apagada.
   */
  abstract execute(id: number): Promise<void>;
}