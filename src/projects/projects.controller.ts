import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PaginationQueryDto } from 'src/DTO/PaginationQueryDTO';
import { SessionAuthGuard } from 'src/Guards/AuthGuard';
import { CreateProjectDto } from './CreateProjectDto';

@Controller('projects')
// @UseGuards(SessionAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get(':id')
  getProject(@Param('id') id: string) {
    return this.projectsService.getProject(id);
  }

  @Get()
  getProjects(@Query() query: PaginationQueryDto, @Req() req) {
    const skip = parseInt(query.skip ?? '0');
    const take = parseInt(query.limit ?? '10');

    return this.projectsService.getProjects({ user: req.user, skip, take });
  }

  @Post()
  addNewProject(@Body() body: CreateProjectDto, @Req() req) {
    const user = req.user;
    return this.projectsService.addNewProject(body, user);
  }
}
