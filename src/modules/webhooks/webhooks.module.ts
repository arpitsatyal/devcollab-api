import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { VectorSyncController } from './vector-sync.controller';
import { PineconeModule } from 'src/common/pinecone/pinecone.module';
import { LiveblocksWebhookController } from './liveblocks-webhook.controller';
import { LiveblocksWebhookService } from './liveblocks-webhook.service';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawBodyMiddleware } from 'src/common/middlewares/raw-body.middleware';

@Module({
  imports: [PineconeModule],
  controllers: [VectorSyncController, LiveblocksWebhookController],
  providers: [LiveblocksWebhookService, QueueService, PrismaService],
})
export class WebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'webhooks/liveblocks', method: RequestMethod.POST });
  }
}
