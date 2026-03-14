import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DocCreateDto, DocUpdateDto } from './dto/docs.dto';
import { QstashService } from 'src/common/qstash/qstash.service';
import { DocRepository } from './repositories/doc.repository';

@Injectable()
export class DocsService {
  constructor(
    private qstashService: QstashService,
    private readonly docRepo: DocRepository,
  ) {}

  async getDoc(docId: string) {
    const doc = await this.docRepo.findUnique(docId);
    if (!doc) throw new NotFoundException(`Doc with id ${docId} not found`);
    return doc;
  }

  async getDocs(workspaceId: string) {
    return this.docRepo.findMany(workspaceId);
  }

  async createDoc(workspaceId: string, dto: DocCreateDto) {
    const doc = await this.docRepo.create({
      label: dto.label,
      workspaceId,
      roomId: `docs_${uuidv4()}`,
    });

    await this.qstashService.publishSyncEvent('doc', doc);
    return doc;
  }

  async updateDoc(docId: string, dto: DocUpdateDto) {
    const updated = await this.docRepo.update(docId, {
      updatedAt: new Date(),
      ...(dto.content && { content: dto.content }),
    });

    if (!updated) throw new NotFoundException('Doc not found');

    await this.qstashService.publishSyncEvent('doc', updated);
    return updated;
  }
}
