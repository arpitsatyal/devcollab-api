import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

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
    skip?: number;
    take?: number;
  }): Promise<Project[]> {
    const { skip, take } = params;

    await this.prisma.user.deleteMany();

    return this.prisma.project.findMany({
      skip,
      take,
    });
  }
}
