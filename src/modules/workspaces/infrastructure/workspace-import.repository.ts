import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkspaceImportRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSnippets(data: Prisma.SnippetCreateManyInput[]) {
    if (data.length === 0) return Promise.resolve();
    return this.prisma.snippet.createMany({ data });
  }

  createDocs(data: Prisma.DocCreateManyInput[]) {
    if (data.length === 0) return Promise.resolve();
    return this.prisma.doc.createMany({ data });
  }
}
