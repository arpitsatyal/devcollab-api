import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { QueueService } from 'src/modules/queue/queue.service';
import {
  WorkItemCreateDto,
  WorkItemUpdateStatusDto,
} from './dto/work-items.dto';
import { Prisma, WorkItem, WorkItemStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { QstashService } from 'src/common/qstash/qstash.service';
import { PrismaCrudService } from 'src/common/services/prisma-crud.service';

@Injectable()
export class WorkItemsService extends PrismaCrudService<WorkItem> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly qstashService: QstashService,
  ) {
    super(prisma.workItem);
  }

  async getWorkItems(workspaceId: string) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    return this.prisma.workItem.findMany({
      where: { workspaceId },
    });
  }

  async getWorkItem(workItemId: string) {
    return this.findByIdOrThrow(workItemId, 'Work item');
  }

  override async update(id: string, data: Prisma.WorkItemUpdateInput) {
    return super.update(id, data);
  }

  async createWorkItem(authorId: string, dto: WorkItemCreateDto) {
    if (!dto.workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    const workItem = await this.prisma.workItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status ?? WorkItemStatus.TODO,
        workspaceId: dto.workspaceId,
        assignedToId: dto.assignedToId,
        authorId,
        snippets: dto.snippetIds
          ? {
              connect: dto.snippetIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    // Notify assignee if present
    if (workItem.assignedToId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: workItem.assignedToId },
      });

      if (assignee?.email) {
        await this.queueService.sendMessage({
          assigneeEmail: assignee.email,
          assigneeName: assignee.name ?? 'Team Member',
          workspaceId: workItem.workspaceId,
          workItemTitle: workItem.title,
          workItemDescription: workItem.description,
          dueDate: workItem.dueDate
            ? dayjs(workItem.dueDate).format('MMMM D, YYYY')
            : null,
          emailType: 'workItemCreated',
        });
      }
    }

    await this.qstashService.publishSyncEvent('workItem', workItem);
    return workItem;
  }

  async updateStatus(workItemId: string, dto: WorkItemUpdateStatusDto) {
    if (!dto.newStatus) {
      throw new BadRequestException('newStatus is required');
    }

    const updatedWorkItem = await this.prisma.workItem.update({
      where: { id: workItemId },
      data: { status: dto.newStatus },
    });

    if (updatedWorkItem.assignedToId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: updatedWorkItem.assignedToId },
      });

      if (assignee?.email) {
        await this.queueService.sendMessage({
          assigneeEmail: assignee.email,
          assigneeName: assignee.name ?? 'Team Member',
          workspaceId: updatedWorkItem.workspaceId,
          workItemTitle: updatedWorkItem.title,
          status: updatedWorkItem.status,
          emailType: 'workItemUpdated',
        });
      }
    }

    await this.qstashService.publishSyncEvent('workItem', updatedWorkItem);
    return updatedWorkItem;
  }

  async getDueSoon(thresholdDays = 1) {
    const now = dayjs();
    const thresholdDate = now.add(thresholdDays, 'day');

    return this.prisma.workItem.findMany({
      where: {
        dueDate: {
          gte: now.toDate(),
          lte: thresholdDate.toDate(),
        },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        workspaceId: true,
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
