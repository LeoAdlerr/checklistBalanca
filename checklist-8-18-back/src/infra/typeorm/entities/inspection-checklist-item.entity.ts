import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn
} from 'typeorm';

import { InspectionEntity } from './inspection.entity';
import { MasterInspectionPointEntity } from './master-inspection-point.entity';
import { LookupChecklistItemStatusEntity } from './lookup-checklist-item-status.entity';
import { ItemEvidenceEntity } from './item-evidence.entity';

@Entity('inspection_checklist_items')
export class InspectionChecklistItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspection_id' })
  inspectionId: number;

  @ManyToOne(() => InspectionEntity, inspection => inspection.items)
  @JoinColumn({ name: 'inspection_id' })
  inspection: InspectionEntity;

  @Column({ name: 'master_point_id' })
  masterPointId: number;

  @ManyToOne(() => MasterInspectionPointEntity)
  @JoinColumn({ name: 'master_point_id' })
  masterPoint: MasterInspectionPointEntity;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => LookupChecklistItemStatusEntity)
  @JoinColumn({ name: 'status_id' })
  status: LookupChecklistItemStatusEntity;

  @Column({ type: 'text', nullable: true })
  observations: string;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ItemEvidenceEntity, evidence => evidence.checklistItem)
  evidences: ItemEvidenceEntity[];
} 