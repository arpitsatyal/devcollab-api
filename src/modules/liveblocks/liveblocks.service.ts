import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Liveblocks } from '@liveblocks/node';
import { LiveblocksUserDto } from './liveblocksUser.dto';

@Injectable()
export class LiveblocksService {
  private liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });

  async authorizeRoom(user: LiveblocksUserDto, room: string) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const userId = user.id || user.email;
    const userInfo = {
      name: user.name || '',
      email: user.email || '',
      avatar: user.image || '',
      color: '#0074C2',
    };

    const session = this.liveblocks.prepareSession(userId, { userInfo });

    const allowedPrefixes = [
      `snippet_`,
      `snippet_draft_`,
      `playground_`,
      `docs_`,
    ];

    const isAllowedRoom =
      typeof room === 'string' &&
      allowedPrefixes.some((prefix) => room.startsWith(prefix));

    if (isAllowedRoom) {
      session.allow(room, session.FULL_ACCESS);
    }

    const { body, status } = await session.authorize();

    return { body: JSON.parse(body), status };
  }
}
