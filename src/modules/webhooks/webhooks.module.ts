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
import { QueueModule } from '../queue/queue.module';
import { RawBodyMiddleware } from 'src/common/middlewares/raw-body.middleware';
import { UsersModule } from '../users/users.module';
import { DocsModule } from '../docs/docs.module';

@Module({
  imports: [PineconeModule, QueueModule, UsersModule, DocsModule],
  controllers: [VectorSyncController, LiveblocksWebhookController],
  providers: [LiveblocksWebhookService],
})
export class WebhooksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'webhooks/liveblocks', method: RequestMethod.POST });
  }
}
