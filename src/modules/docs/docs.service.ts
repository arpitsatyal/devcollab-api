import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Doc } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { DocCreateDto, DocUpdateDto } from './dto/docs.dto';
import { QstashService } from 'src/common/qstash/qstash.service';
import { PrismaCrudService } from 'src/common/services/prisma-crud.service';
import { DocRepository } from './repositories/doc.repository';

@Injectable()
export class DocsService extends PrismaCrudService<Doc> {
  constructor(
    private qstashService: QstashService,
    private readonly docRepo: DocRepository,
  ) {
    super(docRepo);
  }

  async getDoc(docId: string) {
    return this.findByIdOrThrow(docId, 'Doc');
  }

  async getDocs(workspaceId: string) {
    return this.docRepo.findMany({
      where: { workspaceId },
    });
  }

  async createDoc(workspaceId: string, dto: DocCreateDto) {
    const doc = await this.docRepo.create({
      data: {
        label: dto.label,
        workspace: { connect: { id: workspaceId } },
        roomId: `docs_${uuidv4()}`,
      },
    });

    await this.qstashService.publishSyncEvent('doc', doc);
    return doc;
  }

  async updateDoc(docId: string, dto: DocUpdateDto) {
    const updateData: Prisma.DocUpdateInput = {
      updatedAt: new Date(),
      ...(dto.content && { content: dto.content }),
    };

    try {
      const updated = await this.docRepo.update({
        where: { id: docId },
        data: updateData,
      });

      await this.qstashService.publishSyncEvent('doc', updated);
      return updated;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Doc not found');
      }
      throw error;
    }
  }
}
