// Este tipo define o "payload" que será enviado para a API ao criar uma inspeção.
export interface CreateInspectionDto {
  inspectorName: string;
  driverName: string;
  modalityId: number;
  operationTypeId: number;
  unitTypeId: number;

  // Campos Opcionais
  entryRegistration?: string;
  vehiclePlates?: string;
  transportDocument?: string;
  containerTypeId?: number;
  verifiedLength?: number;
  verifiedWidth?: number;
  verifiedHeight?: number;
}