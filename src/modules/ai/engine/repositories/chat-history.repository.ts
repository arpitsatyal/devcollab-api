import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class ChatHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRecentHistory(chatId: string, limit: number): Promise<string> {
    const pastMessages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return pastMessages
      .map((m) => (m.isUser ? `User: ${m.content}` : `AI: ${m.content}`))
      .join('\n');
  }
}
