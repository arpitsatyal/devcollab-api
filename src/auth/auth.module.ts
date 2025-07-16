import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './google.strategy';

@Module({
  providers: [AuthService, PrismaService, UsersService, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
