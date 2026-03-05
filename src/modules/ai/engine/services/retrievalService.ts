import { Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PrismaService } from 'src/common/services/prisma.service';
import { VectorStoreService } from '../pinecone/vectorStore';
import { RetrievalPort } from '../contracts/ports';

@Injectable()
export class RetrievalService implements RetrievalPort {
  private readonly scoreThreshold = 0.5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async generateQueryVariations(
    query: string,
    llm: BaseChatModel,
  ): Promise<string[]> {
    const prompt = `You are an AI assistant helping to expand a user's search query.
    Generate 3 alternative versions of the following query to improve search retrieval. 
    Focus on synonyms, related concepts, and technical terms relevant to software development.
    Return ONLY the 3 queries, one per line, without any numbering or extra text.
    
    Query: "${query}"`;

    try {
      const content = await llm.pipe(new StringOutputParser()).invoke(prompt);
      const variations = content
        .split('\n')
        .filter((q) => q.trim().length > 0)
        .slice(0, 3);
      return [query, ...variations];
    } catch (e) {
      console.warn('[Query Expansion] Failed:', e);
      return [query];
    }
  }

  private async keywordSearch(query: string, filters?: Record<string, any>) {
    const results: any[] = [];
    const workspaceId = filters?.workspaceId;

    try {
      if (!workspaceId) {
        const workspaces = await this.prisma.workspace.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
        });
        results.push(
          ...workspaces.map((w) => ({
            pageContent: `Workspace Title: ${w.title}\nDescription: ${w.description || 'No description'}`,
            metadata: {
              type: 'workspace',
              workspaceId: w.id,
              workspaceTitle: w.title,
            },
          })),
        );
      }

      if (workspaceId) {
        const workItems = await this.prisma.workItem.findMany({
          where: {
            workspaceId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
          include: { workspace: true },
        });
        results.push(
          ...workItems.map((w) => ({
            pageContent: `Work Item Title: ${w.title}\nStatus: ${w.status}\nDescription: ${w.description || 'No description'}`,
            metadata: {
              type: 'workItem',
              workspaceId: w.workspaceId,
              workspaceTitle: w.workspace.title,
            },
          })),
        );

        const snippets = await this.prisma.snippet.findMany({
          where: {
            workspaceId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: 3,
          include: { workspace: true },
        });
        results.push(
          ...snippets.map((s) => ({
            pageContent: `Snippet Title: ${s.title}\nLanguage: ${s.language}\nContent:\n${s.content}`,
            metadata: {
              type: 'snippet',
              workspaceId: s.workspaceId,
              workspaceTitle: s.workspace.title,
            },
          })),
        );

        const docs = await this.prisma.doc.findMany({
          where: {
            workspaceId,
            label: { contains: query, mode: 'insensitive' },
          },
          take: 3,
          include: { workspace: true },
        });
        results.push(
          ...docs.map((d) => {
            const contentStr =
              typeof d.content === 'string'
                ? d.content
                : JSON.stringify(d.content || {});
            return {
              pageContent: `Doc Label: ${d.label}\nContent:\n${contentStr}`,
              metadata: {
                type: 'doc',
                workspaceId: d.workspaceId,
                workspaceTitle: d.workspace.title,
              },
            };
          }),
        );
      }
    } catch (e) {
      console.error('Keyword search failed:', e);
    }
    return results;
  }

  async performHybridSearch(
    queries: string[],
    originalQuery: string,
    filters?: Record<string, any>,
  ) {
    const vectorStore = await this.vectorStoreService.getVectorStore();

    const vectorSearchPromises = queries.map((q) =>
      vectorStore.similaritySearchWithScore(q, 5, filters as any),
    );

    const vectorResultsArrays = await Promise.all(vectorSearchPromises);
    const allVectorResults = vectorResultsArrays.flat();

    const combinedResults: any[] = [];
    const seenContent = new Set<string>();

    allVectorResults.forEach(([doc, score]) => {
      const signature = doc.pageContent.substring(0, 50);
      if (!seenContent.has(signature)) {
        seenContent.add(signature);
        combinedResults.push([doc, score]);
      }
    });

    const keywordResults = await this.keywordSearch(originalQuery, filters);

    keywordResults.forEach((doc) => {
      const isDuplicate = combinedResults.some(([vDoc]) =>
        vDoc.pageContent.includes(doc.pageContent.substring(0, 50)),
      );
      if (!isDuplicate) {
        combinedResults.push([doc, 0.9] as any);
      }
    });

    combinedResults.sort((a, b) => b[1] - a[1]);

    const finalResults = combinedResults
      .filter(([doc, score]) => score >= this.scoreThreshold)
      .slice(0, 10);

    return finalResults;
  }
}
