import { Test, TestingModule } from '@nestjs/testing';
import { DocsService } from './docs.service';
import { QstashService } from 'src/common/qstash/qstash.service';
import { DocRepository } from './repositories/doc.repository';

describe('DocsService', () => {
  let service: DocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocsService,
        { provide: QstashService, useValue: {} },
        { provide: DocRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<DocsService>(DocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
