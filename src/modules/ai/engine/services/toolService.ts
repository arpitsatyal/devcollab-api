import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolRegistry } from '../contracts/ports';
import { SnippetRepository } from 'src/modules/snippets/repositories/snippet.repository';
import { DocRepository } from 'src/modules/docs/repositories/doc.repository';
import { WorkItemRepository } from 'src/modules/work-items/repositories/work-item.repository';

@Injectable()
export class ToolService implements ToolRegistry {
  private readonly snippetsTool: DynamicStructuredTool;
  private readonly docsTool: DynamicStructuredTool;
  private readonly existingWorkItemsTool: DynamicStructuredTool;
  private readonly semanticSearchTool: DynamicStructuredTool;

  constructor(
    private readonly snippetRepo: SnippetRepository,
    private readonly docRepo: DocRepository,
    private readonly workItemRepo: WorkItemRepository,
  ) {
    this.snippetsTool = new DynamicStructuredTool({
      name: 'get_snippets',
      description: 'Fetch snippets for a given workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: this.handleGetSnippets.bind(this),
    } as any);

    this.docsTool = new DynamicStructuredTool({
      name: 'get_docs',
      description: 'Fetch documentation pages for a workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: this.handleGetDocs.bind(this),
    } as any);

    this.existingWorkItemsTool = new DynamicStructuredTool({
      name: 'get_existing_work_items',
      description: 'Fetch work items for a workspace ID',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
      }),
      func: this.handleGetWorkItems.bind(this),
    } as any);

    this.semanticSearchTool = new DynamicStructuredTool({
      name: 'semantic_search',
      description:
        'Perform semantic search across docs/snippets/work items within a workspace.',
      schema: z.object({
        workspaceId: z.string().uuid().describe('Workspace ID'),
        query: z.string().describe('Search query'),
      }),
      func: this.handleSemanticSearch.bind(this),
    } as any);
  }

  private async handleGetSnippets({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    const snippets = await this.snippetRepo.findMany(workspaceId, 5);
    if (snippets.length === 0) return 'No snippets found.';
    return JSON.stringify(snippets);
  }

  private async handleGetDocs({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    const docs = await this.docRepo.findMany(workspaceId, 5);
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
  }

  private async handleGetWorkItems({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    const workItems = await this.workItemRepo.findMany(workspaceId, 5);
    if (workItems.length === 0) return 'No work items found.';
    return JSON.stringify(workItems);
  }

  private async handleSemanticSearch({
    query,
    workspaceId,
  }: {
    query: string;
    workspaceId: string;
  }): Promise<string> {
    const snippets = await this.snippetRepo.findManyBySearch(workspaceId, query, 3);

    const workItems = await this.workItemRepo.findManyBySearch(workspaceId, query, 3);

    const docs = await this.docRepo.findManyByLabel(workspaceId, query, 3);

    return JSON.stringify({
      snippets,
      workItems,
      docs,
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
    const list: DynamicStructuredTool[] = [
      this.snippetsTool,
      this.docsTool,
      this.existingWorkItemsTool,
      this.semanticSearchTool,
    ];
    const byName = Object.fromEntries(list.map((t) => [t.name, t]));
    return { list, byName };
  }
}
