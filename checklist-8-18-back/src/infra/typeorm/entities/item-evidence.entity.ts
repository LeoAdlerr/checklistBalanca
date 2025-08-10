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

import { InspectionChecklistItemEntity } from './inspection-checklist-item.entity';

@Entity('item_evidences')
export class ItemEvidenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'item_id' })
  itemId: number;

  @ManyToOne(() => InspectionChecklistItemEntity, item => item.evidences)
  @JoinColumn({ name: 'item_id' })
  checklistItem: InspectionChecklistItemEntity;

  @Column({ name: 'file_path', length: 512 })
  filePath: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}