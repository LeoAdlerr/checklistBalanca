import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // ✅ 1. Importar o Swagger
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
  app.useGlobalPipes(new ValidationPipe());

  // --- INÍCIO DA CONFIGURAÇÃO DO SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('API Checklist de Balança')
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
  console.log(`Documentação da API disponível em http://localhost:${port}/api`); // ✅ Log útil
}

bootstrap();