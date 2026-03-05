import { Injectable } from '@nestjs/common';
import { Prisma, Snippet } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class SnippetRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: { where: { id: string }; select?: any; include?: any }) {
    return this.prisma.snippet.findUnique(args);
  }

  findMany(args: Prisma.SnippetFindManyArgs) {
    return this.prisma.snippet.findMany(args);
  }

  create(args: { data: Prisma.SnippetCreateInput }) {
    return this.prisma.snippet.create(args);
  }

  update(args: { where: { id: string }; data: Prisma.SnippetUpdateInput }) {
    return this.prisma.snippet.update(args);
  }

  delete(args: { where: { id: string } }) {
    return this.prisma.snippet.delete(args);
  }
}
