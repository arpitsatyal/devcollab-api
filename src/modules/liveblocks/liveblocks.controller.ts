import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'src/common/guards/auth.guard';
import { LiveblocksService } from './liveblocks.service';
import { Response } from 'express';
import { CurrentUser } from '../users/user.decorator';
import { LiveblocksUserDto } from './liveblocksUser.dto';

@Controller('liveblocks')
export class LiveblocksController {
  constructor(private readonly liveblocksService: LiveblocksService) {}

  @UseGuards(SessionAuthGuard)
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
}
