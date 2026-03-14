import { Module } from '@nestjs/common';
import { VectorStoreService } from './vectorStore';

@Module({
  providers: [VectorStoreService],
  exports: [VectorStoreService],
})
export class VectorModule {}
