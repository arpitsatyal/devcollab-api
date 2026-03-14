import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Workspace, User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateWorkspaceDto } from './dto/workspaces.dto';
import { QstashService } from 'src/common/qstash/qstash.service';
import { randomUUID } from 'crypto';
import { WorkspaceRepository } from './infrastructure/workspace.repository';
import { WorkspaceImportRepository } from './infrastructure/workspace-import.repository';
import { GithubClient } from './infrastructure/github.client';
import { SNIPPET_EXTENSIONS } from './utils/constants';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private prisma: PrismaService,
    private qstashService: QstashService,
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly importRepo: WorkspaceImportRepository,
    private readonly githubClient: GithubClient,
  ) { }

  async getWorkspace(id: string) {
    const workspace = await this.workspaceRepo.findById(id);
    if (!workspace) throw new NotFoundException(`Workspace with id ${id} not found`);
    return workspace;
  }

  async getWorkspaces(params: {
    user: User;
    skip?: number;
    take?: number;
  }): Promise<Workspace[]> {
    const { skip, take, user } = params;

    const userId = user.id;

    return await this.workspaceRepo.findManyRaw(`
        SELECT w.*,
              (uww."userId" IS NOT NULL) AS "isPinned"
        FROM "Workspace" w
        LEFT JOIN "UserPinnedWorkspace" uww
          ON uww."userId" = ${userId}
          AND uww."workspaceId" = w."id"
        ORDER BY "isPinned" DESC, w."createdAt" DESC
        OFFSET ${skip}
        LIMIT ${take};
        `);
  }

  async addNewWorkspace(dto: CreateWorkspaceDto, user: User) {
    const workspace = await this.workspaceRepo.create({
      title: dto.title,
      description: dto.description,
      owner: { connect: { id: user.id } },
    });

    await this.qstashService.publishSyncEvent('workspace', workspace);
    return workspace;
  }

  async togglePinWorkspace(
    params: { isPinned: boolean },
    user: User,
    workspaceId: string,
  ) {
    const { isPinned } = params;

    if (typeof isPinned !== 'boolean') {
      throw new BadRequestException('isPinned must be a boolean.');
    }

    if (isPinned) {
      await this.workspaceRepo.upsertPin(user.id, workspaceId);
    } else {
      await this.workspaceRepo.deletePin(user.id, workspaceId);
    }

    return { pinned: isPinned };
  }

  async fetchRepoTree(url: string) {
    const repoDetails = await this.githubClient.getRepoDetails(url);
    const files = await this.githubClient.getRepoTree(repoDetails);
    return {
      owner: repoDetails.owner,
      repo: repoDetails.repo,
      defaultBranch: repoDetails.defaultBranch,
      files,
      description: repoDetails.description,
    };
  }

  async importRepository(params: {
    url: string;
    selectedFiles: string[];
    user: User;
  }) {
    const { url, selectedFiles, user } = params;
    if (!url) throw new BadRequestException('GitHub URL is required');
    if (!selectedFiles?.length)
      throw new BadRequestException('No files selected for import');

    const repoDetails = await this.githubClient.getRepoDetails(url);

    const workspace = await this.workspaceRepo.create({
      title: repoDetails.repo,
      description: repoDetails.description,
      owner: { connect: { id: user.id } },
    });

    const fetchResults = await Promise.all(
      selectedFiles.map(async (path) => {
        try {
          const content = await this.githubClient.fetchFileContent(
            repoDetails,
            path,
          );
          if (!content) return null;
          const ext = path.split('.').pop()?.toLowerCase();
          const fileName = path.split('/').pop() || '';

          return { path, fileName, ext, content };
        } catch (e) {
          console.error(`Failed to fetch ${path}:`, e);
          return null;
        }
      }),
    );

    const snippetsData: Prisma.SnippetCreateManyInput[] = [];
    const docsData: Prisma.DocCreateManyInput[] = [];

    for (const result of fetchResults) {
      if (!result) continue;

      if (result.ext === 'md') {
        docsData.push({
          label: result.fileName,
          workspaceId: workspace.id,
          roomId: randomUUID(),
          content: { type: 'doc', content: result.content },
        });
      } else if (SNIPPET_EXTENSIONS.includes(result.ext || '')) {
        snippetsData.push({
          title: result.fileName.replace(`.${result.ext}`, ''),
          language: result.ext || 'plaintext',
          extension: result.ext || '',
          content: JSON.stringify(result.content),
          workspaceId: workspace.id,
          authorId: user.id,
        });
      }
    }

    await this.importRepo.createSnippets(snippetsData);
    await this.importRepo.createDocs(docsData);

    await this.qstashService.publishSyncEvent('workspace', workspace);

    return {
      success: true,
      workspace,
      stats: { snippets: snippetsData.length, docs: docsData.length },
    };
  }
}
