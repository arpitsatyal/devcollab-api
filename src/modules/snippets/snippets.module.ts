import { Module } from '@nestjs/common';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { SnippetRepository } from './repositories/snippet.repository';

@Module({
  imports: [QstashModule],
  providers: [SnippetsService, SnippetRepository],
  controllers: [SnippetsController],
})
export class SnippetsModule {}
