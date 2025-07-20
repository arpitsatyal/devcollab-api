import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getChatById(chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chat) throw new NotFoundException('Chat not found');
    return chat;
  }

  async getChatsForUser(userId: string) {
    return this.prisma.chat.findMany({
      where: { senderId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: true },
    });
  }

  async createChat(senderId: string) {
    return this.prisma.chat.create({
      data: { senderId },
    });
  }

  async deleteChat(chatId: string) {
    await this.prisma.chat.delete({
      where: { id: chatId },
    });
    return { success: true };
  }
}
