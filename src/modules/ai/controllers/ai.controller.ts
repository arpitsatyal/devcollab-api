import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'src/common/guards/auth.guard';
import { AiService } from '../services/ai.service';

@Controller('ai')
@UseGuards(SessionAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  ask(@Body() body: any, @Query() query: any) {
    const chatId: string | undefined = body.chatId ?? query.chatId;
    const question: string | undefined = body.question;
    const workspaceId: string | undefined =
      body.workspaceId ?? body.projectId ?? query.workspaceId ?? query.projectId;

    const filters = workspaceId ? { workspaceId } : undefined;
    return this.aiService.ask(chatId, question, filters);
  }

  @Post('analyze-work-item')
  analyze(@Body() body: any, @Query() query: any) {
    const workItemId: string | undefined =
      body.workItemId ?? body.taskId ?? query.workItemId ?? query.taskId;
    return this.aiService.analyzeWorkItem(workItemId);
  }

  @Post('suggest-snippet-filename')
  suggestSnippetFilename(
    @Body() body: { workspaceId?: string; projectId?: string; code: string; language?: string },
  ) {
    const workspaceId = body.workspaceId ?? body.projectId;
    return this.aiService.suggestSnippetFilename({ ...body, workspaceId });
  }

  @Get('suggest-work-items')
  suggestWorkItems(@Query() query: any) {
    const workspaceId: string | undefined = query.workspaceId ?? query.projectId;
    return this.aiService.suggestWorkItems(workspaceId);
  }
}
