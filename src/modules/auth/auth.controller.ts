import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../users/user.decorator';
import { User } from '@prisma/client';
import { SessionAuthGuard } from 'src/common/guards/auth.guard';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    req.logIn(req.user, (err) => {
      if (err) {
        throw new UnauthorizedException('Failed to log in');
      }
      req.session.save((err) => {
        if (err) {
          throw new UnauthorizedException('Failed to save session');
        }
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
      });
    });
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('callback/github')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req, @Res() res) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    req.logIn(req.user, (err) => {
      if (err) {
        throw new UnauthorizedException('Failed to log in');
      }
      req.session.save((err) => {
        if (err) {
          throw new UnauthorizedException('Failed to save session');
        }
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
      });
    });
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
