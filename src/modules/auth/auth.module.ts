import { Module } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './session.serializer.';

@Module({
  imports: [PassportModule.register({ session: true })],
  providers: [
    SessionSerializer,
    PrismaService,
    UsersService,
    GoogleStrategy,
    GithubStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
