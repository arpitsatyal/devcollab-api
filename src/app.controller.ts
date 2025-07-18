import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('login')
  @Render('index')
  showLoginPage() {
    return {};
  }

  @Get('dashboard')
  @Render('dashboard')
  showDashboardPage() {
    return {};
  }
}
