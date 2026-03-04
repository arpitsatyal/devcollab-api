import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiService } from '../services/ai.service';

@Controller('ai')
// @UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  ask(
    @Body('chatId') chatId: string,
    @Body('question') question: string,
    @Body('workspaceId') workspaceId?: string,
  ) {
    const filters = workspaceId ? { workspaceId } : undefined;
    return this.aiService.ask(chatId, question, filters);
  }

  @Post('analyze-work-item')
  analyze(@Body('workItemId') workItemId: string) {
    return this.aiService.analyzeWorkItem(workItemId);
  }

  @Post('suggest-snippet-filename')
  suggestSnippetFilename(
    @Body() body: { workspaceId: string; code: string; language?: string },
  ) {
    return this.aiService.suggestSnippetFilename(body);
  }

  @Get('suggest-work-items')
  suggestWorkItems(@Query('workspaceId') workspaceId: string) {
    return this.aiService.suggestWorkItems(workspaceId);
  }
}
