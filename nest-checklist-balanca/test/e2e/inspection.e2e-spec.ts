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

describe('InspectionController (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  const fixturesDir = path.join(__dirname, 'fixtures');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
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
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
  });

  it('deve completar o ciclo de vida de uma inspeção, incluindo geração de PDF', async () => {
    // ETAPA INICIAL: Buscar IDs de status dinamicamente da API
    const lookupRes = await request(app.getHttpServer())
      .get('/lookups/checklist-item-statuses')
      .expect(200);

    const statuses = lookupRes.body;
    const conformeStatusId = statuses.find(s => s.name === 'CONFORME')?.id;
    const naoConformeStatusId = statuses.find(s => s.name === 'NAO_CONFORME')?.id;

    expect(conformeStatusId).toBeDefined();
    expect(naoConformeStatusId).toBeDefined();

    // CRIAÇÃO
    const createDto: CreateInspectionDto = {
      inspectorName: 'Leonardo Adler E2E',
      driverName: 'Motorista E2E',
      modalityId: 1,
      operationTypeId: 1,
      unitTypeId: 1,
    };
    const createResponse = await request(app.getHttpServer())
      .post('/inspections')
      .send(createDto)
      .expect(201);

    const inspectionId = createResponse.body.id;
    expect(inspectionId).toBeDefined();

    // ATUALIZAÇÃO PARCIAL E TENTATIVA DE FINALIZAÇÃO (ERRO)
    const conformeDto: UpdateInspectionChecklistItemDto = { statusId: conformeStatusId, observations: 'Conforme' };
    for (let point = 1; point <= 18; point++) {
      if (point === 4) continue;
      await request(app.getHttpServer())
        .patch(`/inspections/${inspectionId}/points/${point}`)
        .send(conformeDto)
        .expect(200);
    }

    // Tenta finalizar e espera erro 400
    await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .expect(400);

    // Tenta gerar PDF e espera erro 400
    const pdfFailResponse = await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}/report/pdf`)
      .expect(400);
    expect(pdfFailResponse.body.message).toContain('Pontos pendentes: 4');

    // ESTADO REPROVADO E GERAÇÃO DE PDF
    const naoConformeDto: UpdateInspectionChecklistItemDto = { statusId: naoConformeStatusId, observations: 'Avaria' };
    await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/points/4`)
      .send(naoConformeDto)
      .expect(200);

    // Finaliza a inspeção, que agora deve ser REPROVADA
    const finalizeReprovadoResponse = await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .expect(200);
    expect(finalizeReprovadoResponse.body.status.name).toBe('REPROVADO');

    // Gera o PDF da inspeção REPROVADA com sucesso
    const pdfReprovadoResponse = await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}/report/pdf`)
      .expect(200);
    expect(pdfReprovadoResponse.headers['content-type']).toBe('application/pdf');
    expect(pdfReprovadoResponse.body.length).toBeGreaterThan(0);

    // ESTADO APROVADO E GERAÇÃO DE PDF
    const evidenceFileName = `evidence-${Date.now()}.png`;
    const evidenceImage = path.join(fixturesDir, evidenceFileName);
    fs.writeFileSync(evidenceImage, Buffer.from('fake-image-data'));

    await request(app.getHttpServer())
      .post(`/inspections/${inspectionId}/points/4/evidence`)
      .attach('file', evidenceImage)
      .expect(201);

    // Corrige o ponto 4 para "Conforme"
    await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/points/4`)
      .send(conformeDto)
      .expect(200);

    // Finaliza a inspeção, que agora deve ser APROVADA
    const finalizeAprovadoResponse = await request(app.getHttpServer())
      .patch(`/inspections/${inspectionId}/finalize`)
      .expect(200);
    expect(finalizeAprovadoResponse.body.status.name).toBe('APROVADO');

    // Gera o PDF da inspeção APROVADA com sucesso
    const pdfAprovadoResponse = await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}/report/pdf`)
      .expect(200);
    expect(pdfAprovadoResponse.headers['content-type']).toBe('application/pdf');
    expect(pdfAprovadoResponse.body.length).toBeGreaterThan(0);

    // VERIFICAÇÃO FINAL COM GET BY ID
    const finalGetByIdResponse = await request(app.getHttpServer())
      .get(`/inspections/${inspectionId}`)
      .expect(200);

    const finalItem4 = finalGetByIdResponse.body.items.find(item => item.masterPointId === 4);
    expect(finalItem4.evidences).toHaveLength(1);
    expect(finalItem4.evidences[0].fileName).toBe(evidenceFileName);
  });
  //TESTE E2E PARA VERIFICAÇÃO DE DUPLICATAS
  it('deve verificar inspeções existentes e retornar 404 se não houver duplicatas ativas', async () => {
    // --- CENÁRIO A: Duplicata "EM INSPEÇÃO" encontrada ---
    const initialDto: CreateInspectionDto = {
      inspectorName: 'Inspetor Original',
      driverName: 'Motorista Duplicado',
      modalityId: 1,
      operationTypeId: 2,
      unitTypeId: 1,
    };
    const initialResponse = await request(app.getHttpServer())
      .post('/inspections')
      .send(initialDto)
      .expect(201);
    const existingId = initialResponse.body.id;

    const checkResponse = await request(app.getHttpServer())
      .post('/inspections/check-existing')
      .send(initialDto)
      .expect(200); // ✅ Espera 200 OK

    // A API deve retornar o objeto completo da inspeção já existente
    expect(checkResponse.body.id).toBe(existingId);
    expect(checkResponse.body.inspectorName).toBe('Inspetor Original');

    // --- CENÁRIO B: Inspeção similar, mas já FINALIZADA (não é duplicata) ---
    const lookupRes = await request(app.getHttpServer()).get('/lookups/checklist-item-statuses').expect(200);
    const conformeStatusId = lookupRes.body.find(s => s.name === 'CONFORME')?.id;
    for (let point = 1; point <= 18; point++) {
      await request(app.getHttpServer())
        .patch(`/inspections/${existingId}/points/${point}`)
        .send({ statusId: conformeStatusId })
        .expect(200);
    }
    await request(app.getHttpServer()).patch(`/inspections/${existingId}/finalize`).expect(200);

    // Tenta verificar novamente
    await request(app.getHttpServer())
      .post('/inspections/check-existing')
      .send(initialDto)
      .expect(404); // ✅ Agora espera 404 Not Found
  });


  // Testes de falha para rotas específicas
  describe('Casos de Falha de Rota', () => {
    it('deve retornar 404 Not Found para um ID que não existe', async () => {
      await request(app.getHttpServer())
        .get('/inspections/999999')
        .expect(404);
    });

    it('deve retornar 400 Bad Request para um ID inválido (não numérico)', async () => {
      await request(app.getHttpServer())
        .get('/inspections/um-id-invalido')
        .expect(400);
    });

    it('deve retornar 400 Bad Request para um tipo de lookup inválido', async () => {
      await request(app.getHttpServer())
        .get('/lookups/tipo-que-nao-existe')
        .expect(400);
    });
  });
});