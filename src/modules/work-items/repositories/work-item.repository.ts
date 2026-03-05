import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class WorkItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.WorkItemFindManyArgs) {
    return this.prisma.workItem.findMany(args);
  }

  findById(id: string) {
    return this.prisma.workItem.findUnique({ where: { id } });
  }
}
