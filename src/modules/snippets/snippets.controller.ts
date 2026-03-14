import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { SnippetsCreateDto, SnippetsUpdateDto } from './dto/snippets.dto';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { User } from 'src/common/drizzle/schema';

@Controller('workspaces/:workspaceId/snippets')
// @UseGuards(AuthGuard)
export class SnippetsController {
  constructor(private snippetsService: SnippetsService) {}

  @Get()
  async getSnippets(@Param('workspaceId') workspaceId: string) {
    return this.snippetsService.getSnippets(workspaceId);
  }

  @Get(':snippetId')
  async getSnippet(@Param('snippetId') snippetId: string) {
    return this.snippetsService.getSnippet(snippetId);
  }

  @Post()
  async createSnippet(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: SnippetsCreateDto,
    @CurrentUser() user: User,
  ) {
    const userId = user.id;
    return this.snippetsService.createSnippet(workspaceId, userId, dto);
  }

  @Patch(':snippetId')
  async updateSnippet(
    @Param('snippetId') snippetId: string,
    @Body() dto: SnippetsUpdateDto,
  ) {
    return this.snippetsService.updateSnippet(snippetId, dto);
  }
}
