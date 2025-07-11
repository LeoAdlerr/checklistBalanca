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

@Entity('lookup_checklist_item_statuses')
export class LookupChecklistItemStatusEntity {
  @PrimaryColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;
}