import { WorkItemStatus } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsDate } from 'class-validator';

export class WorkItemCreateDto {
  @IsString()
  title: string;

  @IsString()
  projectId: string;

  @IsEnum(WorkItemStatus)
  status: WorkItemStatus;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  assignedToId: string | null;

  @IsOptional()
  @IsDate()
  dueDate: Date | null;
}

export class WorkItemUpdateStatusDto {
  @IsEnum(WorkItemStatus)
  newStatus: WorkItemStatus;
}
