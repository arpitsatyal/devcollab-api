import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService, UsersService],
})
export class UsersModule {}
