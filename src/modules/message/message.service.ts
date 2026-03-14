import { Injectable } from '@nestjs/common';
import { MessageRepository } from './repositories/message.repository';

@Injectable()
export class MessageService {
  constructor(private readonly repo: MessageRepository) {}

  async saveUserMessage(chatId: string, content: string) {
    return this.repo.create({ data: { chatId, content, isUser: true } });
  }

  async saveAiMessage(chatId: string, content: string) {
    return this.repo.create({ data: { chatId, content, isUser: false } });
  }
}
