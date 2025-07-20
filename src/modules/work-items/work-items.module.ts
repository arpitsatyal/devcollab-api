import { Module } from '@nestjs/common';
import { WorkItemsService } from './work-items.service';
import { WorkItemsController } from './work-items.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { QueueService } from 'src/modules/queue/queue.service';

@Module({
  providers: [WorkItemsService, PrismaService, QueueService],
  controllers: [WorkItemsController],
})
export class WorkItemsModule {}
