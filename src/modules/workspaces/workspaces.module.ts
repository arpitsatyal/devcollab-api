import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { WorkspaceRepository } from './infrastructure/workspace.repository';
import { WorkspaceImportRepository } from './infrastructure/workspace-import.repository';
import { GithubClient } from './infrastructure/github.client';

@Module({
  imports: [QstashModule],
  providers: [
    PrismaService,
    WorkspacesService,
    WorkspaceRepository,
    WorkspaceImportRepository,
    GithubClient,
  ],
  controllers: [WorkspacesController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
