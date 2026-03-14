import { Module } from '@nestjs/common';
import { LlmFactoryService } from './llmFactory';
import { GroqLlmService } from './groqLLM';
import { TogetherLlmService } from './togetherLLM';

@Module({
  providers: [LlmFactoryService, GroqLlmService, TogetherLlmService],
  exports: [LlmFactoryService],
})
export class LlmModule {}
