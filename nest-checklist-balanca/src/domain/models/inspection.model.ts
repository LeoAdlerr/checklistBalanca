import { InspectionChecklistItem } from './inspection-checklist-item.model';

export class Inspection {
  id: number;
  inspectorName: string;
  statusId: number;
  entryRegistration?: string;
  vehiclePlates?: string;
  modalityId: number;
  operationTypeId: number;
  unitTypeId: number;
  containerTypeId?: number;
  startDatetime: Date;
  endDatetime?: Date;
  driverName: string;
  driverSignaturePath?: string;
  inspectorSignaturePath?: string;
  observations?: string;
  generatedPdfPath?: string;
  createdAt: Date;
  updatedAt: Date;
  items: InspectionChecklistItem[]; // Relação com os itens
}