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

  create(args: Prisma.WorkItemCreateArgs) {
    return this.prisma.workItem.create(args);
  }

  update(args: Prisma.WorkItemUpdateArgs) {
    return this.prisma.workItem.update(args);
  }

  delete(args: Prisma.WorkItemDeleteArgs) {
    return this.prisma.workItem.delete(args);
  }
}
