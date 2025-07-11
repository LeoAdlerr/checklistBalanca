import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { InspectionChecklistItemEntity } from './inspection-checklist-item.entity';
import { LookupStatusEntity } from './lookup-status.entity';
import { LookupModalityEntity } from './lookup-modality.entity';
import { LookupOperationTypeEntity } from './lookup-operation-type.entity';
import { LookupUnitTypeEntity } from './lookup-unit-type.entity';
import { LookupContainerTypeEntity } from './lookup-container-type.entity';

@Entity('inspections')
export class InspectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inspector_name', length: 255 })
  inspectorName: string;

  @Column({ name: 'status_id' })
  statusId: number;

  @ManyToOne(() => LookupStatusEntity)
  @JoinColumn({ name: 'status_id' })
  status: LookupStatusEntity;

  @Column({ name: 'entry_registration', length: 100, nullable: true })
  entryRegistration: string;

  @Column({ name: 'vehicle_plates', length: 20, nullable: true })
  vehiclePlates: string;

  @Column({ name: 'modality_id' })
  modalityId: number;

  @ManyToOne(() => LookupModalityEntity)
  @JoinColumn({ name: 'modality_id' })
  modality: LookupModalityEntity;

  @Column({ name: 'operation_type_id' })
  operationTypeId: number;

  @ManyToOne(() => LookupOperationTypeEntity)
  @JoinColumn({ name: 'operation_type_id' })
  operationType: LookupOperationTypeEntity;

  @Column({ name: 'unit_type_id' })
  unitTypeId: number;

  @ManyToOne(() => LookupUnitTypeEntity)
  @JoinColumn({ name: 'unit_type_id' })
  unitType: LookupUnitTypeEntity;

  @Column({ name: 'container_type_id', nullable: true })
  containerTypeId: number;

  @ManyToOne(() => LookupContainerTypeEntity)
  @JoinColumn({ name: 'container_type_id' })
  containerType: LookupContainerTypeEntity;

  @Column({ name: 'start_datetime' })
  startDatetime: Date;

  @Column({ name: 'end_datetime', nullable: true })
  endDatetime: Date;

  @Column({ name: 'driver_name', length: 255 })
  driverName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InspectionChecklistItemEntity, item => item.inspection, {
    cascade: true,
  })
  items: InspectionChecklistItemEntity[];
}