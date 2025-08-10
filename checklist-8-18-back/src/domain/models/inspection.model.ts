import { InspectionChecklistItem } from './inspection-checklist-item.model';
import { Lookup } from './lookup.model';

export class Inspection {
  // Propriedades Principais
  id: number;
  inspectorName: string;
  statusId: number;
  driverName: string;
  startDatetime: Date;
  endDatetime?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Propriedades da Inspeção
  entryRegistration?: string;
  vehiclePlates?: string;
  transportDocument?: string;
  observations?: string;
  actionTaken?: string;
  generatedPdfPath?: string;

  // Propriedades de Relações (IDs)
  modalityId: number;
  operationTypeId: number;
  unitTypeId: number;
  containerTypeId?: number;

  // Propriedades das Medidas Verificadas
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;

  // Propriedades dos Lacres
  sealUagaPostInspection?: string;
  sealUagaPostLoading?: string;
  sealShipper?: string;
  sealRfb?: string;
  
  // Propriedades da Verificação de Lacres
  sealVerificationRfbStatusId?: number;
  sealVerificationShipperStatusId?: number;
  sealVerificationTapeStatusId?: number;
  sealVerificationResponsibleName?: string;
  sealVerificationDate?: Date;
  
  // Propriedades dos Caminhos de Arquivo (Assinaturas)
  driverSignaturePath?: string;
  inspectorSignaturePath?: string;
  sealVerificationSignaturePath?: string;

  // Relações com outras entidades (objetos)
  items: InspectionChecklistItem[];
  status?: Lookup;
  modality?: Lookup;
  operationType?: Lookup;
  unitType?: Lookup;
  containerType?: Lookup;
  sealVerificationRfbStatus?: Lookup;
  sealVerificationShipperStatus?: Lookup;
  sealVerificationTapeStatus?: Lookup;
}