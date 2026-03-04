import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { ChatEngineService } from '../engine/services/chatEngine.service';
import { SuggestionService } from '../engine/services/suggestionService';

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngineService: ChatEngineService,
    private readonly suggestionService: SuggestionService,
  ) {}

  async ask(chatId: string, question: string, filters?: Record<string, any>) {
    if (!chatId) {
      throw new BadRequestException('Chat Id is required.');
    }
    if (!question) {
      throw new BadRequestException('Question is required.');
    }

    await this.prisma.message.create({
      data: {
        chatId,
        content: question,
        isUser: true,
      },
    });

    const { answer } = await this.aiEngineService.getAIResponse(chatId, question, filters);

    await this.prisma.message.create({
      data: {
        chatId,
        content: answer,
        isUser: false,
      },
    });

    return { answer };
  }

  async analyzeWorkItem(workItemId: string) {
    if (!workItemId) throw new BadRequestException('Work item ID is required');

    const plan = await this.suggestionService.generateImplementationPlan(workItemId);

    await this.prisma.workItem.update({
      where: { id: workItemId },
      data: { aiPlan: JSON.stringify(plan) },
    });

    return { plan };
  }

  async suggestSnippetFilename(params: {
    workspaceId: string;
    code: string;
    language?: string;
  }) {
    if (!params.workspaceId) throw new BadRequestException('Workspace ID is required');
    if (!params.code?.trim())
      throw new BadRequestException('Code is required to suggest a filename');

    const fileName = await this.suggestionService.suggestSnippetFilenameForCode(params);
    return { fileName };
  }

  async suggestWorkItems(workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    const suggestions = await this.suggestionService.suggestWorkItems(workspaceId);
    return { suggestions };
  }
}
