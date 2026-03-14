import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class TogetherLlmService {
  create() {
    return new ChatOpenAI({
      modelName: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      apiKey: process.env.TOGETHER_API_KEY!,
      configuration: {
        baseURL: 'https://api.together.xyz/v1',
      },
      maxTokens: 3072,
      temperature: 0.7,
    });
  }
}
