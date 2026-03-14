import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Prisma, Workspace } from '@prisma/client';

@Injectable()
export class WorkspaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.workspace.findUnique({ where: { id } });
  }

  findManyRaw(query: any) {
    return this.prisma.$queryRaw<Workspace[]>(query);
  }

  create(data: Prisma.WorkspaceCreateInput) {
    return this.prisma.workspace.create({ data });
  }

  upsertPin(userId: string, workspaceId: string) {
    return this.prisma.userPinnedWorkspace.upsert({
      where: { userId_workspaceId: { userId, workspaceId } },
      update: {},
      create: { userId, workspaceId },
    });
  }

  deletePin(userId: string, workspaceId: string) {
    return this.prisma.userPinnedWorkspace.deleteMany({
      where: { userId, workspaceId },
    });
  }

  update(args: Prisma.WorkspaceUpdateArgs) {
    return this.prisma.workspace.update(args);
  }

  delete(args: Prisma.WorkspaceDeleteArgs) {
    return this.prisma.workspace.delete(args);
  }
}
