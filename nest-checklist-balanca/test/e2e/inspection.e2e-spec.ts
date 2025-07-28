import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateInspectionDto } from 'src/api/dtos/create-inspection.dto';
import { UpdateInspectionChecklistItemDto } from 'src/api/dtos/update-inspection-checklist-item.dto';
import { DataSource } from 'typeorm';
import { InspectionEntity } from 'src/infra/typeorm/entities/inspection.entity';
import * as path from 'path';
import * as fs from 'fs';
import { UpdateInspectionDto } from 'src/api/dtos/update-inspection.dto';

describe('InspectionController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const fixturesDir = path.join(__dirname, 'fixtures');
  const uploadsDir = path.join(process.cwd(), 'uploads');

  const validCreateDto: CreateInspectionDto = {
    inspectorName: 'E2E Inspector',
    driverName: 'E2E Driver',
    modalityId: 1,
    operationTypeId: 1,
    unitTypeId: 1,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
    if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });
  });

  beforeEach(async () => {
    const repository = dataSource.getRepository(InspectionEntity);
    await repository.query('SET FOREIGN_KEY_CHECKS = 0;');
    await repository.query('TRUNCATE TABLE `item_evidences`;');
    await repository.query('TRUNCATE TABLE `inspection_checklist_items`;');
    await repository.query('TRUNCATE TABLE `inspections`;');
    await repository.query('SET FOREIGN_KEY_CHECKS = 1;');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
    if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true, force: true });
    if (fs.existsSync(uploadsDir)) fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  it('deve simular a jornada completa de uma inspeção e verificar a evidência no final', async () => {
    // CRIAÇÃO
    const createResponse = await request(app.getHttpServer()).post('/inspections').send(validCreateDto).expect(201);
    const inspectionId = createResponse.body.id;

    // SETUP (Preenchimento dos pontos)
    const statuses = (await request(app.getHttpServer()).get('/lookups/checklist-item-statuses')).body;
    const conformeStatusId = statuses.find(s => s.name === 'CONFORME')?.id;
    const conformeDto: UpdateInspectionChecklistItemDto = { statusId: conformeStatusId };
    for (let point = 1; point <= 18; point++) {
      if (point === 4) continue;
      await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/points/${point}`).send(conformeDto).expect(200);
    }

    // ESTADO REPROVADO
    const naoConformeStatusId = statuses.find(s => s.name === 'NAO_CONFORME')?.id;
    await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/points/4`).send({ statusId: naoConformeStatusId }).expect(200);
    await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/finalize`).expect(200);

    // UPLOAD DE EVIDÊNCIA
    const evidenceFileName = 'test-evidence.png';
    const evidenceImage = path.join(fixturesDir, evidenceFileName);
    fs.writeFileSync(evidenceImage, 'fake-image-data');
    const uploadResponse = await request(app.getHttpServer())
      .post(`/inspections/${inspectionId}/points/4/evidence`)
      .attach('file', evidenceImage)
      .expect(201);

    const savedFilePath = path.join(process.cwd(), uploadResponse.body.filePath);
    expect(fs.existsSync(savedFilePath)).toBe(true);

    // ESTADO APROVADO
    await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/points/4`).send(conformeDto).expect(200);
    await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/finalize`).expect(200);

    // VERIFICAÇÃO FINAL E CRÍTICA DO GET BY ID 
    const finalGetResponse = await request(app.getHttpServer()).get(`/inspections/${inspectionId}`).expect(200);
    const itemWithEvidence = finalGetResponse.body.items.find(item => item.masterPointId === 4);
    expect(itemWithEvidence).toBeDefined();
    expect(itemWithEvidence.evidences).toHaveLength(1);
    expect(itemWithEvidence.evidences[0].fileName).toBe(uploadResponse.body.fileName);
  });

  describe('Validações de Upload de Evidência', () => {
    let inspectionId: number;

    beforeEach(async () => {
      const createDto = { ...validCreateDto, inspectorName: 'Upload Validation' };
      const res = await request(app.getHttpServer()).post('/inspections').send(createDto).expect(201);
      inspectionId = res.body.id;
    });

    it('deve rejeitar com erro 400 um ficheiro que não seja uma imagem', async () => {
      const notAnImage = path.join(fixturesDir, 'document.txt');
      fs.writeFileSync(notAnImage, 'this is not an image');
      await request(app.getHttpServer()).post(`/inspections/${inspectionId}/points/1/evidence`).attach('file', notAnImage).expect(400);
    });

    it('deve rejeitar com erro 413 um ficheiro maior que o limite', async () => {
      const largeImage = path.join(fixturesDir, 'large-file.png');
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
      fs.writeFileSync(largeImage, largeBuffer);
      const response = await request(app.getHttpServer()).post(`/inspections/${inspectionId}/points/1/evidence`).attach('file', largeImage);
      expect(response.status).toBe(413);
    });

    it('deve retornar 404 ao tentar fazer upload para um ponto de inspeção inexistente', async () => {
      const evidenceImage = path.join(fixturesDir, 'test-evidence.png');
      fs.writeFileSync(evidenceImage, 'fake-image-data');
      await request(app.getHttpServer()).post(`/inspections/${inspectionId}/points/99/evidence`).attach('file', evidenceImage).expect(404);
    });
  });

  describe('Funcionalidades de Edição e Exclusão (PATCH / DELETE)', () => {
    let inspectionId: number;

    beforeEach(async () => {
      const res = await request(app.getHttpServer()).post('/inspections').send(validCreateDto).expect(201);
      inspectionId = res.body.id;
    });

    it('PATCH /inspections/:id - deve atualizar os dados de uma inspeção', async () => {
      const updateDto: UpdateInspectionDto = { driverName: 'Motorista Nome Alterado' };
      await request(app.getHttpServer()).patch(`/inspections/${inspectionId}`).send(updateDto).expect(200);
      const getResponse = await request(app.getHttpServer()).get(`/inspections/${inspectionId}`);
      expect(getResponse.body.driverName).toBe('Motorista Nome Alterado');
    });

    it('DELETE /inspections/:inspectionId/points/:pointNumber/evidence - deve apagar uma evidência', async () => {
      const pointNumber = 1;
      const evidenceImage = path.join(fixturesDir, 'evidence-to-delete.png');
      fs.writeFileSync(evidenceImage, 'delete-me');
      const uploadResponse = await request(app.getHttpServer()).post(`/inspections/${inspectionId}/points/${pointNumber}/evidence`).attach('file', evidenceImage).expect(201);
      
      const fileName = uploadResponse.body.fileName;
      const evidencePath = path.join(process.cwd(), uploadResponse.body.filePath);
      expect(fs.existsSync(evidencePath)).toBe(true);

      //  Chama a rota e envia o 'fileName' no corpo
      await request(app.getHttpServer())
        .delete(`/inspections/${inspectionId}/points/${pointNumber}/evidence`)
        .send({ fileName })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain(`Evidência "${fileName}" apagada com sucesso.`);
        });
      
      const getResponse = await request(app.getHttpServer()).get(`/inspections/${inspectionId}`);
      const item = getResponse.body.items.find(i => i.masterPointId === pointNumber);
      expect(item.evidences).toHaveLength(0);
      expect(fs.existsSync(evidencePath)).toBe(false);
    });

    it('DELETE /inspections/:id - deve apagar uma inspeção e retornar uma mensagem de sucesso', async () => {
      const evidenceImage = path.join(fixturesDir, 'evidence-to-delete-folder.png');
      fs.writeFileSync(evidenceImage, 'delete-folder');
      await request(app.getHttpServer()).post(`/inspections/${inspectionId}/points/1/evidence`).attach('file', evidenceImage);

      // Espera 200 OK e uma mensagem no corpo
      await request(app.getHttpServer())
        .delete(`/inspections/${inspectionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain(`Inspeção com ID ${inspectionId} apagada com sucesso.`);
        });

      await request(app.getHttpServer()).get(`/inspections/${inspectionId}`).expect(404);
    });

    it('DELETE /inspections/:id - deve retornar 403 ao tentar apagar uma inspeção finalizada', async () => {
      const statuses = (await request(app.getHttpServer()).get('/lookups/checklist-item-statuses')).body;
      const conformeStatusId = statuses.find(s => s.name === 'CONFORME')?.id;
      for (let point = 1; point <= 18; point++) {
        await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/points/${point}`).send({ statusId: conformeStatusId });
      }
      await request(app.getHttpServer()).patch(`/inspections/${inspectionId}/finalize`).expect(200);

      await request(app.getHttpServer()).delete(`/inspections/${inspectionId}`).expect(403);
    });
  });
});