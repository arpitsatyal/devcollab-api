import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { LiveblocksService } from './liveblocks.service';
import { Response } from 'express';
import { CurrentUser } from 'src/modules/users/user.decorator';
import { LiveblocksUserDto } from './liveblocksUser.dto';
import { WebhookService } from './webhook.service';

@Controller('liveblocks')
export class LiveblocksController {
  constructor(
    private readonly liveblocksService: LiveblocksService,
    private readonly webhookService: WebhookService,
  ) {}

  // @UseGuards(SessionAuthGuard)
  @Post('auth')
  async authorize(
    @CurrentUser() user: LiveblocksUserDto,
    @Body('room') room: string,
    @Res() res: Response,
  ) {
    const { body, status } = await this.liveblocksService.authorizeRoom(
      user,
      room,
    );

    return res.status(status).json(body);
  }

  @Post('webhook')
  async webhook(@Body() payload: any) {
    return this.webhookService.handleWebhook(payload);
  }
}
