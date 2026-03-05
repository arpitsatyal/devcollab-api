import { Test, TestingModule } from '@nestjs/testing';
import { LiveblocksController } from './liveblocks.controller';
import { LiveblocksService } from './liveblocks.service';

describe('LiveblocksController', () => {
  let controller: LiveblocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveblocksController],
      providers: [
        {
          provide: LiveblocksService,
          useValue: { authorizeRoom: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<LiveblocksController>(LiveblocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
