import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatEngineService } from '../engine/services/chatEngine.service';
import { SuggestionService } from '../engine/services/suggestionService';
import { MessageService } from 'src/modules/message/message.service';
import { WorkItemsService } from 'src/modules/work-items/work-items.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiEngineService: ChatEngineService,
    private readonly suggestionService: SuggestionService,
    private readonly messageService: MessageService,
    private readonly workItemsService: WorkItemsService,
  ) {}

  async ask(chatId: string, question: string, filters?: Record<string, any>) {
    if (!chatId) {
      throw new BadRequestException('Chat Id is required.');
    }
    if (!question) {
      throw new BadRequestException('Question is required.');
    }

    await this.messageService.saveUserMessage(chatId, question);

    const { answer } = await this.aiEngineService.getAIResponse(
      chatId,
      question,
      filters,
    );

    await this.messageService.saveAiMessage(chatId, answer);

    return { answer };
  }

  async analyzeWorkItem(workItemId: string) {
    if (!workItemId) throw new BadRequestException('Work item ID is required');

    const plan =
      await this.suggestionService.generateImplementationPlan(workItemId);

    await this.workItemsService.update(workItemId, {
      aiPlan: JSON.stringify(plan),
    });

    return { plan };
  }

  async suggestSnippetFilename(params: {
    workspaceId: string;
    code: string;
    language?: string;
  }) {
    if (!params.workspaceId)
      throw new BadRequestException('Workspace ID is required');
    if (!params.code?.trim())
      throw new BadRequestException('Code is required to suggest a filename');

    const fileName =
      await this.suggestionService.suggestSnippetFilenameForCode(params);
    return { fileName };
  }

  async suggestWorkItems(workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    const suggestions =
      await this.suggestionService.suggestWorkItems(workspaceId);
    return { suggestions };
  }
}
