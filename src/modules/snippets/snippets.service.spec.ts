import { Test, TestingModule } from '@nestjs/testing';
import { SnippetsService } from './snippets.service';
import { QstashService } from 'src/common/qstash/qstash.service';
import { SnippetRepository } from './repositories/snippet.repository';

describe('SnippetsService', () => {
  let service: SnippetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnippetsService,
        { provide: QstashService, useValue: {} },
        { provide: SnippetRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<SnippetsService>(SnippetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
