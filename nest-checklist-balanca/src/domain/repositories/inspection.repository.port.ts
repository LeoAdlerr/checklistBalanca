import { Inspection } from '../models/inspection.model';
import { InspectionChecklistItem } from '../models/inspection-checklist-item.model';
import { ItemEvidence } from '../models/item-evidence.model';

export abstract class InspectionRepositoryPort {
  abstract create(inspectionData: Partial<Inspection>): Promise<Inspection>;

  abstract updateItemByPoint(
    inspectionId: number,
    pointNumber: number,
    itemData: Partial<InspectionChecklistItem>,
  ): Promise<InspectionChecklistItem | null>;

  abstract findItemByInspectionAndPoint(
    inspectionId: number,
    pointNumber: number,
    options?: { loadRelations?: boolean }
  ): Promise<InspectionChecklistItem | null>;

  abstract addEvidenceToItem(evidenceData: Partial<ItemEvidence>): Promise<ItemEvidence>;
  
  abstract findExistingInspection(inspectionData: Partial<Inspection>): Promise<Inspection | null>;

  abstract findByIdWithItems(inspectionId: number): Promise<Inspection | null>;

  abstract findByIdWithDetails(inspectionId: number): Promise<Inspection | null>;

  abstract update(inspectionId: number, inspectionData: Partial<Inspection>): Promise<void>;

  abstract findAll(): Promise<Inspection[]>;

  abstract findById(id: number): Promise<Inspection | null>;

  abstract delete(id: number): Promise<void>;

  abstract findEvidenceById(id: number): Promise<ItemEvidence | null>;

  abstract deleteEvidence(id: number): Promise<void>;

  abstract findEvidenceByFileName(
    inspectionId: number,
    pointNumber: number,
    fileName: string,
  ): Promise<ItemEvidence | null>;
}