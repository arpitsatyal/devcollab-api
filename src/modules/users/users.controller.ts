import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from './user.decorator';
import { User } from '@prisma/client';

@Controller('users')
// @UseGuards(SessionAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return {
      user,
    };
  }
}
