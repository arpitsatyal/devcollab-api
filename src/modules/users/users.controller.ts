import { Controller, Get, Param, Query } from '@nestjs/common';
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

  @Get('search/by-name')
  search(@Query('text') text: string) {
    return this.usersService.searchByName(text);
  }

  @Get('stats/me')
  stats(@CurrentUser() user: User) {
    return this.usersService.getStatsByEmail(user.email!);
  }

  @Get('liveblocks')
  liveblocks(@Query('userIds') userIds: string) {
    const ids = userIds ? userIds.split(',') : [];
    return this.usersService.getLiveblocksUsers(ids);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
