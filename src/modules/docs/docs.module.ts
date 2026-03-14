import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { DocRepository } from './repositories/doc.repository';

@Module({
  imports: [QstashModule],
  providers: [DocsService, DocRepository],
  controllers: [DocsController],
  exports: [DocsService, DocRepository],
})
export class DocsModule {}
