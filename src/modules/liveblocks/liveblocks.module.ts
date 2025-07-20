import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { LiveblocksService } from './liveblocks.service';
import { LiveblocksController } from './liveblocks.controller';
import { WebhookService } from './webhook.service';
import { RawBodyMiddleware } from 'src/common/middlewares/raw-body.middleware';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from 'src/common/services/prisma.service';

@Module({
  providers: [LiveblocksService, WebhookService, QueueService, PrismaService],
  controllers: [LiveblocksController],
})
export class LiveblocksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'liveblocks/webhook', method: RequestMethod.POST });
  }
}
