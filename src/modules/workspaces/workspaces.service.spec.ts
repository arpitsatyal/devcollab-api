import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { QstashService } from 'src/common/qstash/qstash.service';
import { WorkspaceRepository } from './infrastructure/workspace.repository';
import { WorkspaceImportRepository } from './infrastructure/workspace-import.repository';
import { GithubClient } from './infrastructure/github.client';

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: QstashService, useValue: {} },
        { provide: WorkspaceRepository, useValue: {} },
        { provide: WorkspaceImportRepository, useValue: {} },
        { provide: GithubClient, useValue: {} },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
