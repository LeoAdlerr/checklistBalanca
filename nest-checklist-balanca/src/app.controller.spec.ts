import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LookupStatusEntity } from './infra/typeorm/entities/lookup-status.entity';

// 1. Criamos um mock do nosso repositório. Ele simula o comportamento do
//    banco de dados, retornando dados de exemplo sem precisar de uma conexão real.
const mockLookupStatusRepository = {
  find: jest.fn().mockResolvedValue([
    { id: 1, name: 'EM_INSPECAO' },
    { id: 2, name: 'APROVADO' },
    { id: 3, name: 'REPROVADO' },
  ]),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // 2. Aqui, nós instruímos o NestJS a usar nosso mock sempre que
        //    o Repository<LookupStatusEntity> for solicitado.
        {
          provide: getRepositoryToken(LookupStatusEntity),
          useValue: mockLookupStatusRepository,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    // 3. O teste agora é `async` porque o método do controller é assíncrono.
    it('should return API status and database connection status', async () => {
      // 4. Definimos o resultado que esperamos receber.
      const expectedResult = {
        status: 'UAGA Checklist API is running!',
        database_connection: 'Success',
        statuses_found: ['EM_INSPECAO', 'APROVADO', 'REPROVADO'],
      };

      // 5. Executamos o método e esperamos a Promise ser resolvida.
      const result = await appController.getHello();

      // 6. Comparamos o resultado com o que esperávamos.
      expect(result).toEqual(expectedResult);
    });
  });
});