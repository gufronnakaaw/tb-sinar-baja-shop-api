import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { SuccessResponse } from './utils/global/global.response';

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

  @Post('/sync/products')
  @HttpCode(HttpStatus.CREATED)
  async syncProducts(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.appService.syncProducts(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/sync/categories')
  @HttpCode(HttpStatus.CREATED)
  async syncCategories(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.appService.syncCategories(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/sync/products/:id_kategori')
  @HttpCode(HttpStatus.OK)
  async syncProductByCategories(
    @Param('id_kategori') id_kategori: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.syncProductByCategories(id_kategori),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/polling')
  @HttpCode(HttpStatus.OK)
  async getPolling(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.appService.polling(),
      };
    } catch (error) {
      throw error;
    }
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
}
