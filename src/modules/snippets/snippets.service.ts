import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { SnippetsCreateDto, SnippetsUpdateDto } from './snippets.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SnippetsService {
  constructor(private prisma: PrismaService) {}

  async getSnippet(snippetId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) throw new NotFoundException('Snippet not found');
    return snippet;
  }

  async getSnippets(projectId: string) {
    return this.prisma.snippet.findMany({
      where: { projectId },
    });
  }

  async createSnippet(
    projectId: string,
    authorId: string,
    dto: SnippetsCreateDto,
  ) {
    return this.prisma.snippet.create({
      data: {
        title: dto.title,
        language: dto.language,
        content: dto.content,
        extension: dto.extension,
        authorId,
        projectId,
      },
    });
  }

  async updateSnippet(snippetId: string, dto: SnippetsUpdateDto) {
    const { title, language, content, extension, lastEditedById } = dto;

    const updateData: Prisma.SnippetUpdateInput = {
      ...(title && { title }),
      ...(language && { language }),
      ...(content && { content }),
      ...(extension && { extension }),
      ...(lastEditedById && {
        lastEditedBy: { connect: { id: lastEditedById } },
      }),
    };

    return this.prisma.snippet.update({
      where: { id: snippetId },
      data: updateData,
    });
  }
}
