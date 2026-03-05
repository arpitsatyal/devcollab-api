import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'src/common/services/prisma-crud.service';
import { Chat } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ChatService extends PrismaCrudService<Chat> {
  constructor(private prisma: PrismaService) {
    super(prisma.chat);
  }

  async getChatById(chatId: string) {
    return this.findByIdOrThrow(chatId, 'Chat', {
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async getChatsForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: { senderId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: true },
    });
  }

  async createChat(senderId: string) {
    return this.create({ data: { senderId } });
  }

  async deleteChat(chatId: string) {
    await this.delete(chatId);
    return { success: true };
  }
}
