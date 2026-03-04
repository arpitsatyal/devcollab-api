import { Controller, Get, Query } from '@nestjs/common';
import { WorkItemsService } from './work-items.service';

@Controller('dueWorkItems')
export class DueWorkItemsController {
  constructor(private readonly workItemsService: WorkItemsService) {}

  @Get()
  getDueSoon(@Query('days') days?: string) {
    const threshold = days ? parseInt(days, 10) : 1;
    return this.workItemsService.getDueSoon(threshold);
  }
}
