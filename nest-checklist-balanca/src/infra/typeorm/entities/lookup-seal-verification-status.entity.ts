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

@Entity('lookup_seal_verification_statuses')
export class LookupSealVerificationStatusEntity {
    @PrimaryColumn()
    id: number;

    @Column({ length: 50, unique: true })
    name: string;
}