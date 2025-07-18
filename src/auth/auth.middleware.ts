import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.session['userId'];
    if (userId) {
      try {
        const user = await this.usersService.findById(userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        console.error('AuthMiddleware error:', error);
      }
    }
    next();
  }
}
