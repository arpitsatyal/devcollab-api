import { Module } from '@nestjs/common';
import { VectorSyncController } from './vector-sync.controller';
import { PineconeModule } from 'src/common/pinecone/pinecone.module';

@Module({
  imports: [PineconeModule],
  controllers: [VectorSyncController],
})
export class WebhooksModule {}
