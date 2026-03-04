import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { SnippetsCreateDto, SnippetsUpdateDto } from './snippets.dto';
import { Prisma } from '@prisma/client';
import { QstashService } from 'src/common/qstash/qstash.service';

@Injectable()
export class SnippetsService {
  constructor(
    private prisma: PrismaService,
    private qstashService: QstashService,
  ) {}

  async getSnippet(snippetId: string) {
    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
    });

    if (!snippet) throw new NotFoundException('Snippet not found');
    return snippet;
  }

  async getSnippets(workspaceId: string) {
    return this.prisma.snippet.findMany({
      where: { workspaceId },
    });
  }

  async createSnippet(
    workspaceId: string,
    authorId: string,
    dto: SnippetsCreateDto,
  ) {
    const snippet = await this.prisma.snippet.create({
      data: {
        title: dto.title,
        language: dto.language,
        content: dto.content,
        extension: dto.extension,
        authorId,
        workspaceId,
      },
    });

    await this.qstashService.publishSyncEvent('snippet', snippet);
    return snippet;
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

    const updated = await this.prisma.snippet.update({
      where: { id: snippetId },
      data: updateData,
    });

    await this.qstashService.publishSyncEvent('snippet', updated);
    return updated;
  }
}
