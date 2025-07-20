import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async saveUserMessage(chatId: string, content: string) {
    return this.prisma.message.create({
      data: { chatId, content, isUser: true },
    });
  }

  async saveAiMessage(chatId: string, content: string) {
    return this.prisma.message.create({
      data: { chatId, content, isUser: false },
    });
  }
}
