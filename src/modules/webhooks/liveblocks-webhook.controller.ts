import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LiveblocksWebhookService } from './liveblocks-webhook.service';
import { LiveblocksWebhookDto } from 'src/modules/liveblocks/dto/webhook.dto';

@Controller('webhooks/liveblocks')
export class LiveblocksWebhookController {
  constructor(
    private readonly liveblocksWebhookService: LiveblocksWebhookService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() payload: LiveblocksWebhookDto) {
    return this.liveblocksWebhookService.handleWebhook(payload);
  }
}
