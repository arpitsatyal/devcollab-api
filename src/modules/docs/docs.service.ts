import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { DocCreateDto, DocUpdateDto } from './docs.dto';
import { QstashService } from 'src/common/qstash/qstash.service';

@Injectable()
export class DocsService {
  constructor(
    private prisma: PrismaService,
    private qstashService: QstashService,
  ) {}

  async getDoc(docId: string) {
    const doc = await this.prisma.doc.findUnique({
      where: { id: docId },
    });

    if (!doc) throw new NotFoundException('Doc not found');

    return doc;
  }

  async getDocs(workspaceId: string) {
    return this.prisma.doc.findMany({
      where: { workspaceId },
    });
  }

  async createDoc(workspaceId: string, dto: DocCreateDto) {
    const doc = await this.prisma.doc.create({
      data: {
        label: dto.label,
        workspaceId,
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
      const updated = await this.prisma.doc.update({
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
