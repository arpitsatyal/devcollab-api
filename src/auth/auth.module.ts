import { Module } from '@nestjs/common';
import { SessionSerializer } from './SessionSerializer';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthMiddleware } from './auth.middleware';

@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [
    SessionSerializer,
    PrismaService,
    UsersService,
    GoogleStrategy,
    GithubStrategy,
    AuthMiddleware,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
