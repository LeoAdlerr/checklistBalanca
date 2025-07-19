import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './infra/config/config.module';
import { TypeormModule } from './infra/typeorm/typeorm.module';
import { TypeormService } from './infra/typeorm/typeorm.service';
import { InspectionModule } from './modules/inspection.module';
import { LookupModule } from './modules/lookup.module';

@Module({
  imports: [
    ConfigModule,
    TypeormModule,
    TypeOrmModule.forRootAsync({
      imports: [TypeormModule],
      useExisting: TypeormService,
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
    InspectionModule,
    LookupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}