import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toEqual('UAGA Checklist API is running!');
        expect(res.body.database_connection).toEqual('Success');
        expect(res.body.statuses_found).toEqual(
          expect.arrayContaining(['EM_INSPECAO', 'APROVADO', 'REPROVADO']),
        );
      });
  });
});