import { Controller, Get, Post, Delete, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { User } from '@prisma/client';

@Controller('chats')
// @UseGuards(AuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  getUserChats(@CurrentUser() user: User) {
    const userId = user.id;
    return this.chatService.getChatsForUser(userId);
  }

  @Get(':chatId')
  getChatById(@Param('chatId') chatId: string) {
    return this.chatService.getChatById(chatId);
  }

  @Post()
  createChat(@CurrentUser() user: User) {
    const userId = user.id;
    return this.chatService.createChat(userId);
  }

  @Delete(':chatId')
  deleteChat(@Param('chatId') chatId: string) {
    return this.chatService.deleteChat(chatId);
  }
}
