import { Injectable, NotFoundException } from '@nestjs/common';
import { Project, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateProjectDto } from './CreateProjectDto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }

    return project;
  }

  async getProjects(params: {
    user: User;
    skip?: number;
    take?: number;
  }): Promise<Project[]> {
    const { skip, take, user } = params;

    const userId = user.id as string;

    return await this.prisma.$queryRaw<Project[]>`
        SELECT p.*,
              (upp."userId" IS NOT NULL) AS "isPinned"
        FROM "Project" p
        LEFT JOIN "UserPinnedProject" upp
          ON upp."userId" = ${userId}
          AND upp."projectId" = p."id"
        ORDER BY "isPinned" DESC, p."createdAt" DESC
        OFFSET ${skip}
        LIMIT ${take};
        `;
  }

  async addNewProject(params: CreateProjectDto, user: User) {
    return await this.prisma.project.create({
      data: {
        title: params.title,
        description: params.description,
        ownerId: user.id,
      },
    });
  }
}
