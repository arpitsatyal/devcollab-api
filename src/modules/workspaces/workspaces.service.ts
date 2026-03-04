import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Workspace, User } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateWorkspaceDto } from './workspaces.dto';
import { QstashService } from 'src/common/qstash/qstash.service';
import { Octokit } from '@octokit/rest';
import { randomUUID } from 'crypto';

@Injectable()
export class WorkspacesService {
  private readonly octokit = new Octokit();

  constructor(
    private prisma: PrismaService,
    private qstashService: QstashService,
  ) {}

  async getWorkspace(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace with id ${id} not found`);
    }

    return workspace;
  }

  async getWorkspaces(params: {
    user: User;
    skip?: number;
    take?: number;
  }): Promise<Workspace[]> {
    const { skip, take, user } = params;

    const userId = user.id as string;

    return await this.prisma.$queryRaw<Workspace[]>`
        SELECT w.*,
              (uww."userId" IS NOT NULL) AS "isPinned"
        FROM "Workspace" w
        LEFT JOIN "UserPinnedWorkspace" uww
          ON uww."userId" = ${userId}
          AND uww."workspaceId" = w."id"
        ORDER BY "isPinned" DESC, w."createdAt" DESC
        OFFSET ${skip}
        LIMIT ${take};
        `;
  }

  async addNewWorkspace(dto: CreateWorkspaceDto, user: User) {
    const workspace = await this.prisma.workspace.create({
      data: {
        title: dto.title,
        description: dto.description,
        ownerId: user.id,
      },
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
      await this.prisma.userPinnedWorkspace.upsert({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          workspaceId,
        },
      });
    } else {
      await this.prisma.userPinnedWorkspace.deleteMany({
        where: {
          userId: user.id,
          workspaceId,
        },
      });
    }

    return { pinned: isPinned };
  }

  private parseGitHubUrl(url: string) {
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }

  async fetchRepoTree(url: string) {
    const repoDetails = this.parseGitHubUrl(url);
    if (!repoDetails) throw new BadRequestException('Invalid GitHub URL');

    const { data: repoData } = await this.octokit.repos.get({
      owner: repoDetails.owner,
      repo: repoDetails.repo,
    });

    const defaultBranch = repoData.default_branch;

    const { data: treeData } = await this.octokit.git.getTree({
      owner: repoDetails.owner,
      repo: repoDetails.repo,
      tree_sha: defaultBranch,
      recursive: 'true',
    });

    const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', 'out'];
    const files = treeData.tree
      .filter(
        (item: any) =>
          item.type === 'blob' && !IGNORED_DIRS.some((dir) => item.path?.includes(dir)),
      )
      .map((item: any) => ({
        path: item.path,
        size: item.size,
        url: item.url,
      }));

    return {
      owner: repoDetails.owner,
      repo: repoDetails.repo,
      defaultBranch,
      files,
      description: repoData.description,
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

    const repoDetails = this.parseGitHubUrl(url);
    if (!repoDetails) throw new BadRequestException('Invalid GitHub URL');

    const { data: repoData } = await this.octokit.repos.get({
      owner: repoDetails.owner,
      repo: repoDetails.repo,
    });

    const defaultBranch = repoData.default_branch;

    const workspace = await this.prisma.workspace.create({
      data: {
        title: repoDetails.repo,
        description: repoData.description,
        ownerId: user.id,
      },
    });

    const fetchResults = await Promise.all(
      selectedFiles.map(async (path) => {
        try {
          const { data: contentData } = await this.octokit.repos.getContent({
            owner: repoDetails.owner,
            repo: repoDetails.repo,
            path,
            ref: defaultBranch,
          });

          if (Array.isArray(contentData) || contentData.type !== 'file') return null;

          const content = Buffer.from(contentData.content, 'base64').toString('utf-8');
          const ext = path.split('.').pop()?.toLowerCase();
          const fileName = path.split('/').pop() || '';

          return { path, fileName, ext, content };
        } catch (e) {
          console.error(`Failed to fetch ${path}:`, e);
          return null;
        }
      }),
    );

    const SNIPPET_EXTENSIONS = [
      'js',
      'jsx',
      'ts',
      'tsx',
      'py',
      'go',
      'rb',
      'php',
      'java',
      'c',
      'cpp',
      'cs',
      'rs',
      'html',
      'css',
      'scss',
      'yml',
      'yaml',
      'sh',
      'sql',
    ];

    const snippetsData: any[] = [];
    const docsData: any[] = [];

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

    if (snippetsData.length > 0) {
      await this.prisma.snippet.createMany({ data: snippetsData });
    }
    if (docsData.length > 0) {
      await this.prisma.doc.createMany({ data: docsData });
    }

    await this.qstashService.publishSyncEvent('workspace', workspace);

    return {
      success: true,
      workspace,
      stats: { snippets: snippetsData.length, docs: docsData.length },
    };
  }
}
