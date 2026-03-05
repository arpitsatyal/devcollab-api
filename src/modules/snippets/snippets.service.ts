import { Injectable } from '@nestjs/common';
import { SnippetsCreateDto, SnippetsUpdateDto } from './dto/snippets.dto';
import { Prisma, Snippet } from '@prisma/client';
import { QstashService } from 'src/common/qstash/qstash.service';
import { PrismaCrudService } from 'src/common/services/prisma-crud.service';
import { SnippetRepository } from './repositories/snippet.repository';

@Injectable()
export class SnippetsService extends PrismaCrudService<Snippet> {
  constructor(
    private qstashService: QstashService,
    private readonly snippetRepo: SnippetRepository,
  ) {
    super(snippetRepo);
  }

  async getSnippet(snippetId: string) {
    return this.findByIdOrThrow(snippetId, 'Snippet');
  }

  async getSnippets(workspaceId: string) {
    return this.snippetRepo.findMany({
      where: { workspaceId },
    });
  }

  async createSnippet(
    workspaceId: string,
    authorId: string,
    dto: SnippetsCreateDto,
  ) {
    const snippet = await this.snippetRepo.create({
      data: {
        title: dto.title,
        language: dto.language,
        content: dto.content,
        extension: dto.extension,
        author: { connect: { id: authorId } },
        workspace: { connect: { id: workspaceId } },
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

    const updated = await this.snippetRepo.update({
      where: { id: snippetId },
      data: updateData,
    });

    await this.qstashService.publishSyncEvent('snippet', updated);
    return updated;
  }
}
