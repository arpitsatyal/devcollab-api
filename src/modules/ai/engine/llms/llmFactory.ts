import { Injectable } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { RunnableLike } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';
import { ZodTypeAny } from 'zod';
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
    return await Promise.resolve(
      this.togetherLlmService.create().withFallbacks({
        fallbacks: [this.groqLlmService.create()],
      }) as unknown as BaseChatModel,
    );
  }

  async getSpeedyLLM(): Promise<BaseChatModel> {
    return await Promise.resolve(
      this.groqLlmService.create().withFallbacks({
        fallbacks: [this.togetherLlmService.create()],
      }) as unknown as BaseChatModel,
    );
  }

  async getReasoningStructuredLLM(
    schema: ZodTypeAny | Record<string, any>,
    name: string,
  ): Promise<RunnableLike<any, any>> {
    const primary = this.togetherLlmService.create();
    const fallback = this.groqLlmService.create();

    const structuredPrimary = primary.withStructuredOutput(schema, { name });
    const structuredFallback = fallback.withStructuredOutput(schema, { name });

    return await Promise.resolve(
      structuredPrimary.withFallbacks({
        fallbacks: [structuredFallback],
      }),
    );
  }

  async getReasoningToolBoundLLM(
    tools: StructuredTool[],
  ): Promise<BaseChatModel> {
    const primary = this.togetherLlmService.create();
    const fallback = this.groqLlmService.create();

    const boundPrimary = primary.bindTools(tools);
    const boundFallback = fallback.bindTools(tools);

    return await Promise.resolve(
      boundPrimary.withFallbacks({
        fallbacks: [boundFallback],
      }) as unknown as BaseChatModel,
    );
  }
}
