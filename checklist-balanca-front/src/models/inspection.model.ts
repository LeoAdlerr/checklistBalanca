import type { Lookup } from './lookup.model';

// Interface para as evidências de um item
export interface ItemEvidence {
  id: number;
  filePath: string;
  fileName: string;
}

// Interface para um item do checklist
export interface InspectionChecklistItem {
  id: number;
  masterPointId: number;
  observations?: string;
  statusId: number;
  status: Lookup;
  masterPoint: {
    id: number;
    pointNumber: number;
    name: string;
    description: string;
  };
  evidences: ItemEvidence[];
}

// Interface para a Inspeção completa
export interface Inspection {
  id: number;
  inspectorName: string;
  driverName: string;
  startDatetime: string;
  createdAt: string;
  
  // Relações que são objetos
  status: Lookup;
  modality: Lookup;
  operationType: Lookup;
  unitType: Lookup;
  containerType?: Lookup;

  // Array de itens
  items: InspectionChecklistItem[];

  // Campos opcionais
  entryRegistration?: string;
  vehiclePlates?: string;
  transportDocument?: string;
  endDatetime?: string;
  observations?: string;
  actionTaken?: string;
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;
}