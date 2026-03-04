import { Module } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { QstashModule } from 'src/common/qstash/qstash.module';

@Module({
  imports: [QstashModule],
  providers: [SnippetsService, PrismaService],
  controllers: [SnippetsController],
})
export class SnippetsModule {}
