import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './infra/config/config.module';
import { TypeormModule } from './infra/typeorm/typeorm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormService } from './infra/typeorm/typeorm.service';
import { InspectionModule } from './modules/inspection.module';
import { LookupModule } from './modules/lookup.module';
import { FileSystemModule } from './infra/file-system/file-system.module';

@Module({
  imports: [
    ConfigModule,
    TypeormModule,
    TypeOrmModule.forRootAsync({
      imports: [TypeormModule],
      useExisting: TypeormService,
    }),
    
    // Módulo para servir ficheiros estáticos da pasta 'uploads'
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
    }),
    
    InspectionModule,
    LookupModule,
    FileSystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}