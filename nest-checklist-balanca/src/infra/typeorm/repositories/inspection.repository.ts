import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InspectionRepositoryPort } from 'src/domain/repositories/inspection.repository.port';
import { Inspection } from 'src/domain/models/inspection.model';
import { InspectionChecklistItem } from 'src/domain/models/inspection-checklist-item.model';
import { ItemEvidence } from 'src/domain/models/item-evidence.model';
import { InspectionEntity } from '../entities/inspection.entity';
import { InspectionChecklistItemEntity } from '../entities/inspection-checklist-item.entity';
import { ItemEvidenceEntity } from '../entities/item-evidence.entity';

@Injectable()
export class InspectionRepository implements InspectionRepositoryPort {
  constructor(
    @InjectRepository(InspectionEntity)
    private readonly inspectionRepo: Repository<InspectionEntity>,
    @InjectRepository(InspectionChecklistItemEntity)
    private readonly itemRepo: Repository<InspectionChecklistItemEntity>,
    @InjectRepository(ItemEvidenceEntity)
    private readonly evidenceRepo: Repository<ItemEvidenceEntity>,
  ) { }

  async create(inspectionData: Partial<Inspection>): Promise<Inspection> {
    const newInspection = this.inspectionRepo.create(inspectionData);
    return this.inspectionRepo.save(newInspection);
  }

  async updateItemByPoint(
    inspectionId: number,
    pointNumber: number,
    itemData: Partial<InspectionChecklistItem>,
  ): Promise<InspectionChecklistItem | null> {
    const itemToUpdate = await this.itemRepo.findOneBy({
      inspectionId,
      masterPointId: pointNumber,
    });

    if (!itemToUpdate) return null;

    await this.itemRepo.update(itemToUpdate.id, itemData);

    return this.itemRepo.findOne({
      where: { id: itemToUpdate.id },
      relations: {
        masterPoint: true,
        status: true,
      },
    });
  }

  async addEvidenceToItem(
    evidenceData: Partial<ItemEvidence>,
  ): Promise<ItemEvidence> {
    const newEvidence = this.evidenceRepo.create(evidenceData);
    return this.evidenceRepo.save(newEvidence);
  }
  private mapToDomainInspection(entity: InspectionEntity): Inspection {
    const inspectionModel = new Inspection();
    Object.assign(inspectionModel, entity);
    return inspectionModel;
  }

  async findByIdWithItems(inspectionId: number): Promise<Inspection | null> {
    const inspectionEntity = await this.inspectionRepo.findOne({
      where: { id: inspectionId },
      relations: ['items'],
    });

    return inspectionEntity ? this.mapToDomainInspection(inspectionEntity) : null;
  }

  async findItemByInspectionAndPoint(
    inspectionId: number,
    pointNumber: number,
  ): Promise<InspectionChecklistItem | null> {
    return this.itemRepo.findOne({
      where: {
        inspectionId: inspectionId,
        masterPointId: pointNumber,
      },
      relations: {
        masterPoint: true,
      },
    });
  }

  async update(
    inspectionId: number,
    inspectionData: Partial<Inspection>,
  ): Promise<void> {
    await this.inspectionRepo.update(inspectionId, inspectionData);
  }

  async findByIdWithDetails(inspectionId: number): Promise<Inspection | null> {
    const inspectionEntity = await this.inspectionRepo.findOne({
      where: { id: inspectionId },
      // Carregamos as relações que queremos exibir na resposta final
      relations: {
        status: true, // O status geral da inspeção (Aprovado/Reprovado)
        items: true,  // Os 18 itens do checklist
      },
    });

    return inspectionEntity ? this.mapToDomainInspection(inspectionEntity) : null;
  }

  async findAll(): Promise<Inspection[]> {
    const inspectionEntities = await this.inspectionRepo.find({
      // Para a lista geral, é uma boa prática carregar o status de cada inspeção.
      relations: {
        status: true,
      },
      // E também ordenar os resultados, trazendo os mais recentes primeiro.
      order: {
        createdAt: 'DESC',
      },
    });

    // Usamos o 'map' para converter cada entidade do banco para o nosso modelo de domínio.
    return inspectionEntities.map(entity => this.mapToDomainInspection(entity));
  }

  async findById(id: number): Promise<Inspection | null> {
    const inspectionEntity = await this.inspectionRepo.findOne({
      where: { id: id },
      relations: {
        status: true, // Carrega o status principal da inspeção.
        items: {      // Carrega os itens do checklist...
          status: true, // ...e também o status de cada um desses itens.
        },
      },
    });

    return inspectionEntity ? this.mapToDomainInspection(inspectionEntity) : null;
  }
}
