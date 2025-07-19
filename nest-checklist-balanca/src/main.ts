import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises';
import * as path from 'path';

async function bootstrap() {
  // Seu código para garantir o diretório tmp continua aqui, sem alterações.
  const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    console.log(`Diretório garantido: ${tmpDir}`);
  } catch (err) {
    console.error(`Erro ao criar diretório ${tmpDir}:`, err);
  }

  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsOriginsString = configService.get<string>('cors.origins');

  // GARANTIA DE SEGURANÇA: Lidamos com o caso de a variável ser indefinida.
  // Se a string existir, nós a processamos. Senão, usamos um array vazio como fallback.
  const allowedOrigins = corsOriginsString
    ? corsOriginsString.split(',').map(origin => origin.trim())
    : [];

  // Se nenhuma origem for definida, é uma boa prática permitir pelo menos a origem do Swagger
  if (allowedOrigins.length === 0) {
    const port = configService.get('port');
    console.warn(`Nenhuma origem CORS definida. Permitindo apenas o acesso local para a documentação.`);
    allowedOrigins.push(`http://localhost:${port}`);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  console.log(`CORS habilitado para as origens:`, allowedOrigins);

  app.useGlobalPipes(new ValidationPipe());

  // --- INÍCIO DA CONFIGURAÇÃO DO SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('API Checklist 8/18')
    .setDescription('Documentação completa para a API de inspeções de 8/18')
    .setVersion('1.0')
    .addTag('Inspections', 'Endpoints para gerenciar inspeções')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // A UI da documentação ficará em /api
  // --- FIM DA CONFIGURAÇÃO DO SWAGGER ---

  const port = process.env.PORT || 8888;
  await app.listen(port);

  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Documentação da API disponível em http://localhost:${port}/api`);
}

bootstrap();