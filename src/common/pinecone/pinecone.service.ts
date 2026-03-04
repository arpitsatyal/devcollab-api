import { Injectable, Logger } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeInferenceEmbeddings } from 'src/modules/ai/engine/pinecone/pinecone-embeddings';
import prisma from 'src/common/prisma/client';

export type SyncType = 'workspace' | 'workItem' | 'snippet' | 'doc';

@Injectable()
export class PineconeService {
  private readonly logger = new Logger(PineconeService.name);
  private readonly client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  private readonly indexName = process.env.PINECONE_INDEX!;
  private readonly embeddings = new PineconeInferenceEmbeddings();

  async syncToVectorStore(type: SyncType, id: string, action: 'upsert' | 'delete') {
    const index = this.client.index({ name: this.indexName });

    if (action === 'delete') {
      try {
        await (index as any).deleteOne({ id });
        this.logger.log(`[VectorSync] Deleted ${type}: ${id}`);
      } catch (e: any) {
        this.logger.error(`[VectorSync] Failed to delete ${type}: ${id}`, e?.message || e);
      }
      return;
    }

    let data: any;
    try {
      switch (type) {
        case 'workspace':
          data = await prisma.workspace.findUnique({ where: { id } });
          break;
        case 'workItem':
          data = await prisma.workItem.findUnique({
            where: { id },
            include: { workspace: true },
          });
          break;
        case 'snippet':
          data = await prisma.snippet.findUnique({
            where: { id },
            include: { workspace: true },
          });
          break;
        case 'doc':
          data = await prisma.doc.findUnique({
            where: { id },
            include: { workspace: true },
          });
          break;
      }
    } catch (err) {
      this.logger.error(`[VectorSync] DB fetch failed for ${type}: ${id}`, err);
      return;
    }

    if (!data) {
      this.logger.warn(`[VectorSync] ${type} not found in DB: ${id}. Skipping upsert.`);
      return;
    }

    let text = '';
    const metadata: any = {
      type,
      workspaceId: data.workspaceId || data.id,
      workspaceTitle: data.workspace?.title || data.title || 'Unknown',
    };

    switch (type) {
      case 'workspace':
        text = `Workspace Title: ${data.title}\nDescription: ${data.description || 'No description'}`;
        break;
      case 'workItem':
        text = `Work Item Title: ${data.title}\nStatus: ${data.status}\nDescription: ${data.description || 'No description'}`;
        break;
      case 'snippet':
        text = `Snippet Title: ${data.title}\nLanguage: ${data.language}\nContent:\n${data.content}`;
        metadata.language = data.language;
        break;
      case 'doc': {
        const contentStr =
          typeof data.content === 'string'
            ? data.content
            : JSON.stringify(data.content || {});
        text = `Doc Label: ${data.label}\nContent:\n${contentStr}`;
        break;
      }
    }

    try {
      const values = await this.embeddings.embedDocuments([text]);
      await index.upsert({
        records: [
          {
            id: data.id,
            values: values[0],
            metadata: {
              ...metadata,
              text,
            },
          },
        ],
      });

      this.logger.log(
        `[VectorSync] Upserted ${type}: ${data.id} (${data.title || data.label})`,
      );
    } catch (e: any) {
      this.logger.error(`[VectorSync] Failed to sync ${type}: ${data.id}`, e?.message || e);
    }
  }
}
