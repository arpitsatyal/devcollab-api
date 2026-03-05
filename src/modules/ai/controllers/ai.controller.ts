import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { AskDto } from '../dto/ask.dto';

@Controller('ai')
// @UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  ask(@Body() body: AskDto) {
    const filters = body.workspaceId
      ? { workspaceId: body.workspaceId }
      : undefined;
    return this.aiService.ask(body.chatId, body.question, filters);
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
