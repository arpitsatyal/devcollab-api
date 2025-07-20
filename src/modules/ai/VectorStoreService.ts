import { Injectable } from '@nestjs/common';
import { createVectorStore } from 'src/lib/embedFeatures';

@Injectable()
export class VectorStoreService {
  private vectorStorePromise: ReturnType<typeof createVectorStore> | null =
    null;

  async getStore() {
    if (!this.vectorStorePromise) {
      this.vectorStorePromise = createVectorStore();
    }
    return this.vectorStorePromise;
  }

  async getSimilarContext(query: string, limit = 3): Promise<string> {
    const store = await this.getStore();
    const results = await store.similaritySearch(query, limit);
    return results.map((r) => r.pageContent).join('\n');
  }
}
