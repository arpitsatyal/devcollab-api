import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { WorkItemCreateDto, WorkItemUpdateStatusDto } from './workItems.dto';
import dayjs from 'dayjs';
import { QueueService } from 'src/modules/queue/queue.service';

@Injectable()
export class WorkItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async getWorkItems(projectId: string) {
    return await this.prisma.workItem.findMany({
      where: { projectId },
    });
  }

  async createWorkItem(
    projectId: string,
    authorId: string,
    dto: WorkItemCreateDto,
  ) {
    const workItem = await this.prisma.workItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
        status: dto.status,
        projectId,
        assignedToId: dto.assignedToId,
        authorId,
      },
    });

    if (!workItem.assignedToId) return workItem;

    const assignee = await this.prisma.user.findUnique({
      where: { id: workItem.assignedToId },
    });

    if (assignee?.email) {
      const messageBody = {
        assigneeEmail: assignee.email,
        assigneeName: assignee.name ?? 'Team Member',
        projectId: workItem.projectId,
        taskTitle: workItem.title,
        taskDescription: workItem.description,
        dueDate: workItem.dueDate
          ? dayjs(workItem.dueDate).format('MMMM D, YYYY')
          : null,
        emailType: 'taskCreated', //TODO: fix later
      };

      await this.queueService.sendMessage(messageBody);
    }

    return workItem;
  }

  async updateWorkItemStatus(workItemId: string, dto: WorkItemUpdateStatusDto) {
    const updatedWorkItem = await this.prisma.workItem.update({
      where: { id: workItemId },
      data: { status: dto.newStatus },
    });

    if (!updatedWorkItem.assignedToId) return updatedWorkItem;

    const assignee = await this.prisma.user.findUnique({
      where: { id: updatedWorkItem.assignedToId },
    });

    if (assignee?.email) {
      const messageBody = {
        assigneeEmail: assignee.email,
        assigneeName: assignee.name ?? 'Team Member',
        projectId: updatedWorkItem.projectId,
        taskTitle: updatedWorkItem.title,
        status: updatedWorkItem.status,
        emailType: 'taskUpdated',
      };

      await this.queueService.sendMessage(messageBody);
    }

    return updatedWorkItem;
  }
}
