import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PineconeService, SyncType } from 'src/common/pinecone/pinecone.service';

@Controller('webhooks/vector-sync')
export class VectorSyncController {
  constructor(private readonly pineconeService: PineconeService) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() payload: any) {
    const { type, data, action } = payload || {};
    if (!type || !data?.id) {
      return { error: 'Invalid payload' };
    }

    await this.pineconeService.syncToVectorStore(
      type as SyncType,
      data.id,
      (action as any) ?? 'upsert',
    );
    return { success: true };
  }
}
