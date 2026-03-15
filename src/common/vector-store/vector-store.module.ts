import { Module } from '@nestjs/common';
import { VectorStoreService } from './vector-store.service';
import { VectorStorePort } from './ports/vector-store.port';

@Module({
  providers: [
    { provide: VectorStorePort, useClass: VectorStoreService },
  ],
  exports: [VectorStorePort],
})
export class VectorStoreModule { }
