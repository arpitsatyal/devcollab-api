import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { PineconeInferenceEmbeddings } from './pinecone-embeddings';

@Injectable()
export class VectorStoreService {
  async getVectorStore() {
    const pineconeApiKey = process.env.PINECONE_API_KEY!;
    const index = process.env.PINECONE_INDEX!;

    const pinecone = new Pinecone({
      apiKey: pineconeApiKey,
    });

    const pineconeIndex = pinecone.index(index);
    const embeddings = new PineconeInferenceEmbeddings();

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
    });

    return vectorStore;
  }
}
