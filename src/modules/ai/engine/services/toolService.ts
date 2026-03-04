import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { PrismaService } from 'src/common/services/prisma.service';
import { ToolRegistry } from '../contracts/ports';

@Injectable()
export class ToolService implements ToolRegistry {
  private readonly snippetsTool: DynamicStructuredTool;
  private readonly docsTool: DynamicStructuredTool;
  private readonly existingWorkItemsTool: DynamicStructuredTool;
  private readonly semanticSearchTool: DynamicStructuredTool;

  constructor(private readonly prisma: PrismaService) {
    this.snippetsTool = new DynamicStructuredTool({
      name: 'get_snippets',
      description: 'Fetch snippets for a given workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: async ({ workspaceId }) => {
        const snippets = await this.prisma.snippet.findMany({
          where: { workspaceId },
          take: 5,
        });
        if (snippets.length === 0) return 'No snippets found.';
        return JSON.stringify(
          snippets.map((s) => ({
            title: s.title,
            language: s.language,
            content: s.content,
          })),
        );
      },
    });

    this.docsTool = new DynamicStructuredTool({
      name: 'get_docs',
      description: 'Fetch documentation pages for a workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: async ({ workspaceId }) => {
        const docs = await this.prisma.doc.findMany({
          where: { workspaceId },
          take: 5,
        });
        if (docs.length === 0) return 'No docs found.';
        return JSON.stringify(
          docs.map((d) => ({
            label: d.label,
            content:
              typeof d.content === 'string'
                ? d.content
                : JSON.stringify(d.content || {}),
          })),
        );
      },
    });

    this.existingWorkItemsTool = new DynamicStructuredTool({
      name: 'get_existing_work_items',
      description: 'Fetch work items for a workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: async ({ workspaceId }) => {
        const workItems = await this.prisma.workItem.findMany({
          where: { workspaceId },
          take: 5,
        });
        if (workItems.length === 0) return 'No work items found.';
        return JSON.stringify(
          workItems.map((w) => ({
            title: w.title,
            status: w.status,
            description: w.description,
          })),
        );
      },
    });

    this.semanticSearchTool = new DynamicStructuredTool({
      name: 'semantic_search',
      description:
        'Perform semantic search across docs/snippets/work items within a workspace.',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
        query: z.string().describe('Search query'),
      }),
      func: async ({ query, workspaceId }) => {
        const snippets = await this.prisma.snippet.findMany({
          where: {
            workspaceId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
        });
        const workItems = await this.prisma.workItem.findMany({
          where: {
            workspaceId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
        });
        const docs = await this.prisma.doc.findMany({
          where: {
            workspaceId,
            label: { contains: query, mode: 'insensitive' },
          },
          take: 3,
        });

        return JSON.stringify({
          snippets,
          workItems,
          docs,
        });
      },
    });
  }

  getSnippetsTool() {
    return this.snippetsTool;
  }

  getDocsTool() {
    return this.docsTool;
  }

  getExistingWorkItemsTool() {
    return this.existingWorkItemsTool;
  }

  getSemanticSearchTool() {
    return this.semanticSearchTool;
  }

  getTools() {
    const list = [
      this.snippetsTool,
      this.docsTool,
      this.existingWorkItemsTool,
      this.semanticSearchTool,
    ];
    const byName = Object.fromEntries(list.map((t) => [t.name, t]));
    return { list, byName };
  }
}
