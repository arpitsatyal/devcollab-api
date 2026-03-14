import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { ChatRepository } from './repositories/chat.repository';

@Module({
  providers: [ChatService, PrismaService, ChatRepository],
  controllers: [ChatController],
})
export class ChatModule {}
