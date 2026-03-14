import { Injectable } from '@nestjs/common';
import { eq, asc } from 'drizzle-orm';
import { DrizzleService } from 'src/common/drizzle/drizzle.service';
import { messages } from 'src/common/drizzle/schema';

@Injectable()
export class ChatHistoryRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async getRecentHistory(chatId: string, limit: number): Promise<string> {
    const pastMessages = await this.drizzle.db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);

    return pastMessages
      .map((m) => (m.isUser ? `User: ${m.content}` : `AI: ${m.content}`))
      .join('\n');
  }
}
