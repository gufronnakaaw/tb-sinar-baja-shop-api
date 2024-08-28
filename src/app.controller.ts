import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PreviewQuery } from './app.dto';
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

  @Get('/check')
  @HttpCode(HttpStatus.OK)
  async checkQuantity(
    @Query() query: { kode_item: string; quantity: string },
  ): Promise<SuccessResponse> {
    try {
      if (query.kode_item && query.quantity) {
        return {
          success: true,
          status_code: HttpStatus.OK,
          data: await this.appService.checkQuantity(
            query.kode_item,
            parseInt(query.quantity),
          ),
        };
      }

      return {
        success: true,
        status_code: HttpStatus.OK,
        data: {},
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/preview')
  @UseGuards(UserGuard)
  @HttpCode(HttpStatus.OK)
  async getPreview(@Query() query: PreviewQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getPreview(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/waiting')
  @UseGuards(UserGuard)
  @HttpCode(HttpStatus.OK)
  async getWaiting(@Query() query: { id: string }): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getWaiting(query.id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/payment')
  @UseGuards(UserGuard)
  @HttpCode(HttpStatus.OK)
  async getPayment(@Query() query: { id: string }): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.getPayment(query.id),
      };
    } catch (error) {
      throw error;
    }
  }
}
