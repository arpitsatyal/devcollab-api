import { Module } from '@nestjs/common';
import { WorkItemsController } from './work-items.controller';
import { DueWorkItemsController } from './due-work-items.controller';
import { WorkItemsService } from './work-items.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { QueueModule } from 'src/modules/queue/queue.module';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { WorkItemRepository } from './repositories/work-item.repository';

@Module({
  imports: [QueueModule, QstashModule],
  controllers: [WorkItemsController, DueWorkItemsController],
  providers: [WorkItemsService, WorkItemRepository, PrismaService],
  exports: [WorkItemsService],
})
export class WorkItemsModule {}
