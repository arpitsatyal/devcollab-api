import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { WorkItemStatus } from '@prisma/client';

export class WorkItemCreateDto {
  @IsString()
  title: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsEnum(WorkItemStatus)
  status?: WorkItemStatus;

  @IsOptional()
  @IsUUID()
  assignedToId?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: Date | null;

  @IsOptional()
  snippetIds?: string[];
}

export class TaskUpdateStatusDto {
  @IsEnum(WorkItemStatus)
  newStatus: WorkItemStatus;
}
