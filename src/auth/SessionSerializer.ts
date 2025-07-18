// session.serializer.ts
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, id: string) => void) {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: User | null) => void,
  ) {
    try {
      const user = await this.userService.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Deserialize error:', error);
      done(error, null);
    }
  }
}
