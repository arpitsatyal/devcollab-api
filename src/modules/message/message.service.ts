import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaCrudService } from 'src/common/services/prisma-crud.service';
import { MessageRepository } from './repositories/message.repository';

@Injectable()
export class MessageService extends PrismaCrudService<Message> {
  constructor(private readonly repo: MessageRepository) {
    super(repo);
  }

  async saveUserMessage(chatId: string, content: string) {
    return this.repo.create({ data: { chatId, content, isUser: true } });
  }

  async saveAiMessage(chatId: string, content: string) {
    return this.repo.create({ data: { chatId, content, isUser: false } });
  }
}
