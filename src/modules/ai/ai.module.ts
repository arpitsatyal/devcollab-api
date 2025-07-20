import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { MessageService } from 'src/modules/message/message.service';
import { LlmService } from './LLMService';
import { VectorStoreService } from './VectorStoreService';

@Module({
  providers: [
    AiService,
    PrismaService,
    MessageService,
    LlmService,
    VectorStoreService,
  ],
  controllers: [AiController],
})
export class AiModule {}
