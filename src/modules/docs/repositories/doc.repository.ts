import { Injectable } from '@nestjs/common';
import { Prisma, Doc } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class DocRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: { where: { id: string }; select?: any; include?: any }) {
    return this.prisma.doc.findUnique(args);
  }

  findMany(args?: Prisma.DocFindManyArgs) {
    return this.prisma.doc.findMany(args);
  }

  create(args: { data: Prisma.DocCreateInput }) {
    return this.prisma.doc.create(args);
  }

  update(args: { where: { id: string }; data: Prisma.DocUpdateInput }) {
    return this.prisma.doc.update(args);
  }

  delete(args: { where: { id: string } }) {
    return this.prisma.doc.delete(args);
  }
}
