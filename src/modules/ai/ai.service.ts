import { Injectable, Logger } from '@nestjs/common';
import { MessageService } from 'src/modules/message/message.service';
import { VectorStoreService } from './VectorStoreService';
import { LlmService } from './LLMService';
import { PromptBuilder } from './PromptBuilder';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly llmService: LlmService,
  ) {}

  async askAI(question: string, chatId: string): Promise<string> {
    await this.messageService.saveUserMessage(chatId, question);

    try {
      const context = await this.vectorStoreService.getSimilarContext(question);
      const prompt = PromptBuilder.build(context, question);

      const answer = await this.llmService.ask(prompt);

      await this.messageService.saveAiMessage(chatId, answer);

      return answer;
    } catch (error) {
      this.logger.error(
        'AI Service failed:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
