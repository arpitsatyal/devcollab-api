import { Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { GroqLlmService } from './groqLLM';
import { TogetherLlmService } from './togetherLLM';
import { LlmGateway } from '../contracts/ports';

@Injectable()
export class LlmFactoryService implements LlmGateway {
  constructor(
    private readonly togetherLlmService: TogetherLlmService,
    private readonly groqLlmService: GroqLlmService,
  ) {}

  async getReasoningLLM(): Promise<BaseChatModel> {
    return this.togetherLlmService.create().withFallbacks({
      fallbacks: [this.groqLlmService.create()],
    }) as unknown as BaseChatModel;
  }

  async getSpeedyLLM(): Promise<BaseChatModel> {
    return this.groqLlmService.create().withFallbacks({
      fallbacks: [this.togetherLlmService.create()],
    }) as unknown as BaseChatModel;
  }

  async getReasoningStructuredLLM(schema: any, name: string) {
    const primary = this.togetherLlmService.create();
    const fallback = this.groqLlmService.create();

    const structuredPrimary = primary.withStructuredOutput(schema, { name });
    const structuredFallback = fallback.withStructuredOutput(schema, { name });

    return structuredPrimary.withFallbacks({
      fallbacks: [structuredFallback],
    });
  }

  async getReasoningToolBoundLLM(tools: any[]) {
    const primary = this.togetherLlmService.create();
    const fallback = this.groqLlmService.create();

    const boundPrimary = primary.bindTools(tools);
    const boundFallback = fallback.bindTools(tools);

    return boundPrimary.withFallbacks({
      fallbacks: [boundFallback],
    });
  }
}
