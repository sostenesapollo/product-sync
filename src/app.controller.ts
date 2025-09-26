import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application information and health status' })
  @ApiResponse({
    status: 200,
    description:
      'Application information including version, features, and endpoints',
  })
  getHello(): object {
    return this.appService.getHello();
  }
}
