import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class GroqLlmService {
  create() {
    return new ChatOpenAI({
      modelName: 'meta-llama/llama-4-scout-17b-16e-instruct',
      apiKey: process.env.GROQ_API_KEY!,
      configuration: {
        baseURL: 'https://api.groq.com/openai/v1',
      },
      maxTokens: 4096,
      temperature: 0.7,
    });
  }
}
