import { ItemEvidence } from './item-evidence.model';
import { MasterInspectionPoint } from './master-inspection-point.model';

export class InspectionChecklistItem {
  id: number;
  inspectionId: number;
  masterPointId: number;
  statusId: number;
  observations?: string;
  evidences: ItemEvidence[];
  masterPoint?: MasterInspectionPoint;

  createdAt: Date;
  updatedAt: Date;
}
