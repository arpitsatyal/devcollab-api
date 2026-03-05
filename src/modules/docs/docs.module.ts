import { Module } from '@nestjs/common';
import { DocsService } from './docs.service';
import { DocsController } from './docs.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { QstashModule } from 'src/common/qstash/qstash.module';
import { DocRepository } from './repositories/doc.repository';

@Module({
  imports: [QstashModule],
  providers: [DocsService, DocRepository, PrismaService],
  controllers: [DocsController],
})
export class DocsModule {}
