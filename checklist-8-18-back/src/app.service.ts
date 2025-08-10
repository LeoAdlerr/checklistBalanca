import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string { 
    return 'UAGA Checklist 8/18 API is running!';
  }
}