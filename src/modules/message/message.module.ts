import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { MessageRepository } from './repositories/message.repository';

@Module({
  providers: [MessageService, MessageRepository, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}
