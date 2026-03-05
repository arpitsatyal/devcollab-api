import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  PineconeService,
  SyncType,
} from 'src/common/pinecone/pinecone.service';
import { VectorSyncPayloadDto } from './dto/vector-sync.dto';

@Controller('webhooks/vector-sync')
export class VectorSyncController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() payload: VectorSyncPayloadDto) {
    const { type, data, action } = payload || {};

    await this.pineconeService.syncToVectorStore(
      type,
      data.id,
      (action as any) ?? 'upsert',
    );
    return { success: true };
  }
}
