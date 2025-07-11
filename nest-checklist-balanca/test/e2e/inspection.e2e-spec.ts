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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
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
  });

  describe('Fluxo E2E completo', () => {
    it('Fluxo: cria inspeção, omite ponto, falha finalize, corrige, reprove, corrige, evidencie e aprove', async () => {
      // 1️⃣ Cria inspeção
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

      const inspection = createResponse.body;
      expect(inspection.id).toBeDefined();
      expect(inspection.items).toHaveLength(18);

      // 2️⃣ Atualiza 17 pontos como "Conforme", exceto o ponto 4
      const conformeDto: UpdateInspectionChecklistItemDto = {
        statusId: 2,
        observations: 'Ponto inspecionado — Conforme',
      };

      for (let point = 1; point <= 18; point++) {
        if (point === 4) continue;
        await request(app.getHttpServer())
          .patch(`/inspections/${inspection.id}/points/${point}`)
          .send(conformeDto)
          .expect(200);
      }

      // 3️⃣ Tenta finalizar — deve falhar por ponto faltando
      const finalizeFail = await request(app.getHttpServer())
        .patch(`/inspections/${inspection.id}/finalize`)
        .expect(400);

      expect(finalizeFail.body.message).toContain('existem itens pendentes')

      // 4️⃣ Atualiza ponto 4 como "Não Conforme"
      const naoConformeDto: UpdateInspectionChecklistItemDto = {
        statusId: 3,
        observations: 'Avaria encontrada no ponto 4',
      };

      await request(app.getHttpServer())
        .patch(`/inspections/${inspection.id}/points/4`)
        .send(naoConformeDto)
        .expect(200);

      // 5️⃣ Upload de evidência de avaria
      const fixturesDir = path.join(__dirname, 'fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir);
      }
      const avariaImage = path.join(fixturesDir, 'avaria.png');
      if (!fs.existsSync(avariaImage)) {
        fs.writeFileSync(
          avariaImage,
          Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAGgwJ/lDU1NQAAAABJRU5ErkJggg==',
            'base64',
          )
        );
      }

      await request(app.getHttpServer())
        .post(`/inspections/${inspection.id}/points/4/evidence`)
        .attach('file', avariaImage)
        .expect(201);

      // 6️⃣ Finaliza — agora deve reprovar pois há Não Conforme
      const finalizeReprovadoResponse = await request(app.getHttpServer()) // ✅ Captura a resposta
        .patch(`/inspections/${inspection.id}/finalize`)
        .expect(200);
      // ✅ Valida que o status da inspeção no corpo da resposta é 'REPROVADO'.
      // (Ajuste o nome 'REPROVADO' se no seu banco o status tiver outro nome, como 'Reprovada').
      expect(finalizeReprovadoResponse.body.status.name).toBe('REPROVADO');

      // 7️⃣ Corrige o ponto 4 para "Conforme"
      await request(app.getHttpServer())
        .patch(`/inspections/${inspection.id}/points/4`)
        .send(conformeDto)
        .expect(200);

      // 8️⃣ Upload de evidência da correção
      const correcaoImage = path.join(fixturesDir, 'correcao.png');
      if (!fs.existsSync(correcaoImage)) {
        fs.copyFileSync(avariaImage, correcaoImage);
      }

      await request(app.getHttpServer())
        .post(`/inspections/${inspection.id}/points/4/evidence`)
        .attach('file', correcaoImage)
        .expect(201);

      // 9️⃣ Finaliza — agora deve aprovar
      await request(app.getHttpServer())
        .patch(`/inspections/${inspection.id}/finalize`)
        .expect(200);

      // 🔟 Verifica pastas
      const expectedDir = path.join(
        process.cwd(),
        'uploads',
        `${inspection.id}`,
        '4-LATERAL_ESQUERDA'
      );
      expect(fs.existsSync(expectedDir)).toBe(true);
      const evidences = fs.readdirSync(expectedDir);
      expect(evidences.length).toBeGreaterThanOrEqual(1);
    });

    // NOVO TESTE DE FLUXO CRIATIVO
    it('Fluxo: busca por ID, continua trabalho e a verifica novamente após finalizar', async () => {
      // 1️⃣ ARRANGE: Uma nova inspeção é iniciada, mas o inspetor é "interrompido".
      const createDto: CreateInspectionDto = {
        inspectorName: 'Inspetor Interrompido',
        driverName: 'Motorista C',
        modalityId: 1, operationTypeId: 1, unitTypeId: 1,
      };
      const createResponse = await request(app.getHttpServer())
        .post('/inspections')
        .send(createDto)
        .expect(201);

      const inspectionId = createResponse.body.id;

      // Ele só conseguiu preencher o primeiro ponto.
      await request(app.getHttpServer())
        .patch(`/inspections/${inspectionId}/points/1`)
        .send({ statusId: 2, observations: 'Ponto 1 OK' })
        .expect(200);

      // 2️⃣ ACT & ASSERT: Mais tarde, o inspetor busca a inspeção específica pelo ID para continuar.
      const getByIdResponse = await request(app.getHttpServer())
        .get(`/inspections/${inspectionId}`)
        .expect(200);

      // Valida se os dados da inspeção em andamento estão corretos.
      expect(getByIdResponse.body.id).toBe(inspectionId);
      expect(getByIdResponse.body.inspectorName).toBe('Inspetor Interrompido');
      expect(getByIdResponse.body.status.name).toBe('EM_INSPECAO');
      // Verifica se o progresso que ele fez foi salvo.
      const item1 = getByIdResponse.body.items.find(item => item.masterPointId === 1);
      expect(item1.status.name).toBe('CONFORME');

      // 3️⃣ CONTINUE & FINALIZE: O inspetor finaliza o resto dos pontos.
      for (let point = 2; point <= 18; point++) {
        await request(app.getHttpServer())
          .patch(`/inspections/${inspectionId}/points/${point}`)
          .send({ statusId: 2, observations: `Ponto ${point} OK` })
          .expect(200);
      }

      // E finaliza a inspeção.
      await request(app.getHttpServer())
        .patch(`/inspections/${inspectionId}/finalize`)
        .expect(200);

      // 4️⃣ ASSERT FINAL: O inspetor (ou um gerente) busca o relatório final pelo ID.
      const getFinalReportResponse = await request(app.getHttpServer())
        .get(`/inspections/${inspectionId}`)
        .expect(200);

      // Valida se o relatório final está correto e com status "APROVADO".
      expect(getFinalReportResponse.body.status.name).toBe('APROVADO');
      expect(getFinalReportResponse.body.endDatetime).not.toBeNull(); // A data de fim deve estar preenchida.
    });

    // TESTES PARA CASOS DE FALHA (ESSENCIAIS!)
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
  });
});