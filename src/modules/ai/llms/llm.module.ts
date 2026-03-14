import { Module } from '@nestjs/common';
import { LlmFactoryService } from './llmFactory';
import { GroqLlmService } from './groqLLM';
import { TogetherLlmService } from './togetherLLM';

import { LlmGateway } from '../interfaces/llm.port';

@Module({
  providers: [
    { provide: LlmGateway, useClass: LlmFactoryService },
    GroqLlmService,
    TogetherLlmService,
  ],
  exports: [LlmGateway],
})
export class LlmModule {}
