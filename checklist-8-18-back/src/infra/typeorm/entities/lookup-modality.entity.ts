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

@Entity('lookup_modalities')
export class LookupModalityEntity {
  @PrimaryColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;
}