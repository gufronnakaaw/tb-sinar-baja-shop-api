import { Controller, Get, HttpStatus } from '@nestjs/common';
import { SuccessResponse } from './utils/global/global.response';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): SuccessResponse {
    return {
      success: true,
      status_code: HttpStatus.OK,
      message: 'Welcome to TB Sinar Baja Shop API',
    };
  }
}
