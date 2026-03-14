import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { ToolRegistry } from '../interfaces/tool.port';
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
      name: 'getSnippets',
      description:
        'Fetch ALL code snippets in the workspace. Use this to list snippets or retrieve one by its EXACT title. If you are not 100% sure of the title, omit it and all snippets will be returned.',
      schema: z.object({
        title: z
          .string()
          .optional()
          .describe(
            'ONLY provide if you know the EXACT title of the snippet. If unsure, omit this field entirely.',
          ),
      }),
      func: this.handleGetSnippets.bind(this),
    } as any);

    this.docsTool = new DynamicStructuredTool({
      name: 'getDocs',
      description:
        'Fetch ALL docs in the workspace. Provide label only if you know the exact doc label; otherwise omit it and all docs will be returned.',
      schema: z.object({
        label: z
          .string()
          .optional()
          .describe(
            'ONLY provide if you know the EXACT label of the doc. If unsure, omit this field entirely.',
          ),
      }),
      func: this.handleGetDocs.bind(this),
    } as any);

    this.existingWorkItemsTool = new DynamicStructuredTool({
      name: 'getWorkItems',
      description:
        'Fetch ALL work items and their status (TODO/IN_PROGRESS/DONE). Provide title only if you know the exact work item title; otherwise omit it to list everything.',
      schema: z.object({
        title: z
          .string()
          .optional()
          .describe(
            'ONLY provide if you know the EXACT title of the work item. If unsure, omit this field entirely.',
          ),
      }),
      func: this.handleGetWorkItems.bind(this),
    } as any);

    this.semanticSearchTool = new DynamicStructuredTool({
      name: 'semanticSearch',
      description:
        'Semantic search across snippets, docs, and work items within the current workspace. Use for open-ended conceptual questions.',
      schema: z.object({
        query: z.string().describe('A natural language search query'),
      }),
      func: this.handleSemanticSearch.bind(this),
    } as any);
  }

  private getWorkspaceId(config?: { configurable?: Record<string, any> }) {
    const workspaceId = config?.configurable?.workspaceId as string | undefined;
    return workspaceId;
  }

  private safeParseContent(content: unknown): string {
    if (typeof content === 'string') return content;
    try {
      return JSON.stringify(content);
    } catch {
      return String(content);
    }
  }

  private async handleGetSnippets(
    { title }: { title?: string },
    _runManager?: unknown,
    config?: { configurable?: Record<string, any> },
  ): Promise<string> {
    const workspaceId = this.getWorkspaceId(config);
    if (!workspaceId) return 'Workspace ID is required to fetch snippets.';

    const snippets = title
      ? await this.snippetRepo.findManyBySearch(workspaceId, title, 20)
      : await this.snippetRepo.findMany(workspaceId, 100);

    if (snippets.length === 0) {
      return title
        ? `No code snippets found matching the title or keywords: '${title}'.`
        : 'No code snippets have been created yet.';
    }

    const output = snippets.map((s) => ({
      title: (s as any).title,
      language: (s as any).language,
      content: this.safeParseContent((s as any).content).slice(0, 400) + '...',
    }));
    return `Found exactly ${snippets.length} snippet(s) total in the workspace.\n${JSON.stringify(output)}`;
  }

  private async handleGetDocs(
    { label }: { label?: string },
    _runManager?: unknown,
    config?: { configurable?: Record<string, any> },
  ): Promise<string> {
    const workspaceId = this.getWorkspaceId(config);
    if (!workspaceId) return 'Workspace ID is required to fetch docs.';

    const docs = label
      ? await this.docRepo.findManyByLabel(workspaceId, label, 20)
      : await this.docRepo.findMany(workspaceId, 100);

    if (docs.length === 0) {
      return label
        ? `No documentation found matching the label: '${label}'.`
        : 'No documentation documents have been found.';
    }

    const output = docs.map((d) => ({
      label: d.label,
      content: this.safeParseContent(d.content).slice(0, 400) + '...',
    }));
    return `Found exactly ${docs.length} doc(s) total in the workspace.\n${JSON.stringify(output)}`;
  }

  private async handleGetWorkItems(
    { title }: { title?: string },
    _runManager?: unknown,
    config?: { configurable?: Record<string, any> },
  ): Promise<string> {
    const workspaceId = this.getWorkspaceId(config);
    if (!workspaceId) return 'Workspace ID is required to fetch work items.';

    const workItems = title
      ? await this.workItemRepo.findManyBySearch(workspaceId, title, 20)
      : await this.workItemRepo.findMany(workspaceId, 100);

    if (workItems.length === 0) {
      return title
        ? `No work items found matching the title: '${title}'.`
        : 'No work items have been created yet.';
    }

    const output = workItems.map((w: any) => ({
      title: w.title,
      description: w.description || '',
      status: w.status,
    }));
    return `Found exactly ${workItems.length} work item(s) total in the workspace.\n${JSON.stringify(output)}`;
  }

  private async handleSemanticSearch(
    { query }: { query: string },
    _runManager?: unknown,
    config?: { configurable?: Record<string, any> },
  ): Promise<string> {
    const workspaceId = this.getWorkspaceId(config);
    if (!workspaceId) return 'Workspace ID is required to run semantic search.';

    const snippets = await this.snippetRepo.findManyBySearch(workspaceId, query, 3);
    const workItems = await this.workItemRepo.findManyBySearch(workspaceId, query, 3);
    const docs = await this.docRepo.findManyByLabel(workspaceId, query, 3);

    if (snippets.length === 0 && workItems.length === 0 && docs.length === 0) {
      return 'No relevant content found for that query.';
    }

    return JSON.stringify({ snippets, workItems, docs });
  }

  getSnippetsTool() { return this.snippetsTool; }
  getDocsTool() { return this.docsTool; }
  getExistingWorkItemsTool() { return this.existingWorkItemsTool; }
  getSemanticSearchTool() { return this.semanticSearchTool; }

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
