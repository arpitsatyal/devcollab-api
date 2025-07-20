import { Body, Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
// @UseGuards(AuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}
  @Get('ask-dev-collab')
  getAIAnswer(@Body() question: string, @Param('chatId') chatId: string) {
    return this.aiService.askAI(question, chatId);
  }
}
