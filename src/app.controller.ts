import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { SuccessResponse } from './utils/global/global.response';
import { UserGuard } from './utils/guards/user.guard';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get()
  getHello() {
    return {
      success: true,
      status_code: HttpStatus.OK,
      message: 'Welcome to TB Sinar Baja Shop API',
    };
  }

  @Get('/provinces')
  @HttpCode(HttpStatus.OK)
  async getProvinces(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getProvinces(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/regencies/:code')
  @HttpCode(HttpStatus.OK)
  async getRegencies(@Param('code') code: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getRegencies(code),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/districts/:code')
  @HttpCode(HttpStatus.OK)
  async getDistricts(@Param('code') code: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getDistricts(code),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/homepage')
  @HttpCode(HttpStatus.OK)
  async getHomepage(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getHomepage(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/categories')
  @HttpCode(HttpStatus.OK)
  async getCategories(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getCategories(),
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(UserGuard)
  @Get('/checkout')
  @HttpCode(HttpStatus.OK)
  async getCheckout(@Req() request: Request): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getCheckout(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
