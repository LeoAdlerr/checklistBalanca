import { MasterInspectionPoint } from '../models/master-inspection-point.model';

export abstract class MasterInspectionPointRepositoryPort {
  /**
   * Busca todos os pontos de inspeção mestre.
   * @returns Uma promessa que resolve para um array de MasterInspectionPoint.
   */
  abstract findAll(): Promise<MasterInspectionPoint[]>;
}