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

@Entity('master_inspection_points')
export class MasterInspectionPointEntity {
    @PrimaryColumn()
    id: number;

    @Column({ name: 'point_number', unique: true })
    pointNumber: number;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 50 })
    category: string;
}