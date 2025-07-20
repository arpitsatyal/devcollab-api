import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { Request } from 'express';
import { SnippetsCreateDto, SnippetsUpdateDto } from './snippets.dto';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { User } from '@prisma/client';

@Controller('projects/:projectId/snippets')
// @UseGuards(AuthGuard)
export class SnippetsController {
  constructor(private snippetsService: SnippetsService) {}

  @Get()
  async getSnippets(
    @Param('projectId') projectId: string,
    @Req() req: Request,
  ) {
    return this.snippetsService.getSnippets(projectId);
  }

  @Get(':snippetId')
  async getSnippet(@Param('snippetId') snippetId: string) {
    return this.snippetsService.getSnippets(snippetId);
  }

  @Post()
  async createSnippet(
    @Param('projectId') projectId: string,
    @Body() dto: SnippetsCreateDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return this.snippetsService.createSnippet(projectId, userId, dto);
  }

  @Patch(':snippetId')
  async updateSnippet(
    @Param('snippetId') snippetId: string,
    @Body() dto: SnippetsUpdateDto,
  ) {
    return this.snippetsService.updateSnippet(snippetId, dto);
  }
}
