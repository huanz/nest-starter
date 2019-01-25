import { Get, Controller, UseGuards, UseFilters, Render } from '@nestjs/common';
import { LoginGuard } from './guards/login.guard';
import { AuthExceptionFilter } from './filters/auth.filter';
@Controller()
@UseFilters(new AuthExceptionFilter())
@UseGuards(new LoginGuard())
export class AppController {
  constructor() { }
  @Get()
  @Render('index')
  async root() {

  }
}
