import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { WorkspaceRepository } from './infrastructure/workspace.repository';
import { WorkspaceImportRepository } from './infrastructure/workspace-import.repository';
import { GithubClient } from './infrastructure/github.client';

@Module({
  imports: [QstashModule],
  providers: [
    WorkspacesService,
    WorkspaceRepository,
    WorkspaceImportRepository,
    GithubClient,
  ],
  controllers: [WorkspacesController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
