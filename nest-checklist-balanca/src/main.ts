import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config'
import * as fs from 'fs/promises';
import * as path from 'path';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const tmpDir = path.join(process.cwd(), 'uploads', 'tmp');
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    console.log(`Diretório garantido: ${tmpDir}`);
  } catch (err) {
    console.error(`Erro ao criar diretório ${tmpDir}:`, err);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Esta linha configura o NestJS para servir arquivos estáticos.
  // Ela mapeia a pasta 'uploads' no seu sistema de arquivos para a rota '/uploads' na URL.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const configService = app.get(ConfigService);
  const corsOriginsString = configService.get<string>('cors.origins');
  const allowedOrigins = corsOriginsString
    ? corsOriginsString.split(',').map(origin => origin.trim())
    : [];

  if (allowedOrigins.length === 0) {
    const port = configService.get('port');
    console.warn(`Nenhuma origem CORS definida. Permitindo apenas o acesso local para a documentação.`);
    allowedOrigins.push(`http://localhost:${port}`);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['Content-Disposition'] 
  });

  console.log(`CORS habilitado para as origens:`, allowedOrigins);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('API Checklist 8/18')
    .setDescription('Documentação completa para a API de inspeções de 8/18')
    .setVersion('1.0')
    .addTag('Inspections', 'Endpoints para gerenciar inspeções')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8888;
  await app.listen(port);

  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Documentação da API disponível em http://localhost:${port}/api`);
}

bootstrap();