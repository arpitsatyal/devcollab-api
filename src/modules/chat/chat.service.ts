import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepo: ChatRepository) {}

  async getChatById(chatId: string) {
    const chat = await this.chatRepo.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!chat) {
      throw new NotFoundException(`Chat with id ${chatId} not found`);
    }

    return chat;
  }

  async getChatsForUser(userId: string) {
    return this.chatRepo.findMany({
      where: { senderId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: true },
    });
  }

  async createChat(senderId: string) {
    return this.chatRepo.create({ data: { senderId } });
  }

  async deleteChat(chatId: string) {
    await this.chatRepo.delete({ where: { id: chatId } });
    return { success: true };
  }
}
