import { Test, TestingModule } from '@nestjs/testing';
import { LiveblocksService } from './liveblocks.service';

describe('LiveblocksService', () => {
  let service: LiveblocksService;

  beforeEach(async () => {
    process.env.LIVEBLOCKS_SECRET_KEY = 'sk_test_mock_key';
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveblocksService],
    }).compile();

    service = module.get<LiveblocksService>(LiveblocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
