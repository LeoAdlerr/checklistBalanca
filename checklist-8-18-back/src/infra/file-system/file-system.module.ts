import { Module } from '@nestjs/common';
import { FileSystemPort } from 'src/domain/ports/file-system.port';
import { FileSystemService } from './file-system.service';

@Module({
  providers: [
    {
      provide: FileSystemPort,
      useClass: FileSystemService,
    },
  ],
  exports: [FileSystemPort],
})
export class FileSystemModule {}