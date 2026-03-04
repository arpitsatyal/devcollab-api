import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { PrismaService } from 'src/common/services/prisma.service';
import { QstashModule } from 'src/common/qstash/qstash.module';

@Module({
  imports: [QstashModule],
  providers: [PrismaService, WorkspacesService],
  controllers: [WorkspacesController],
})
export class WorkspacesModule {}
