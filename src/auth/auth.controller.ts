import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleRedirect(@Req() req, @Res() res) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    req.session.userId = req.user.id;
    res.render('dashboard', { user: req.user });
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Get('callback/github')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return { message: 'Login successful', user: req.user };
  }
}
