import { Injectable } from '@nestjs/common';
import { MessageHistoryPort } from '../interfaces/history.port';
import { ChatHistoryRepository } from '../repositories/chat-history.repository';

@Injectable()
export class MessageHistoryService implements MessageHistoryPort {
  constructor(private readonly repo: ChatHistoryRepository) {}

  async getRecentHistory(chatId: string, limit: number): Promise<string> {
    return this.repo.getRecentHistory(chatId, limit);
  }
}
