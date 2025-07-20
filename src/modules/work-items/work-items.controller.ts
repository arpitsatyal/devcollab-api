import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { WorkItemsService } from './work-items.service';
import { WorkItemCreateDto, WorkItemUpdateStatusDto } from './workItems.dto';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { User } from '@prisma/client';

@Controller('projects/:projectId/work-items')
// @UseGuards(AuthGuard)
export class WorkItemsController {
  constructor(private workItemService: WorkItemsService) {}

  @Get()
  getWorkItems(@Param('projectId') projectId: string) {
    return this.workItemService.getWorkItems(projectId);
  }

  @Post()
  createWorkItem(
    @Param('projectId') projectId: string,
    @Body() dto: WorkItemCreateDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return this.workItemService.createWorkItem(projectId, userId, dto);
  }

  @Patch(':workItemId/status')
  updateWorkItemStatus(
    @Param('workItemId') workItemId: string,
    @Body() dto: WorkItemUpdateStatusDto,
  ) {
    return this.workItemService.updateWorkItemStatus(workItemId, dto);
  }
}
