import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UsersController } from './users.controller';

@Module({
  providers: [PrismaService, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
