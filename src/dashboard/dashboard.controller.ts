import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ProductQuery } from 'src/products/product.dto';
import { SuccessResponse } from 'src/utils/global/global.response';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('products')
  @HttpCode(HttpStatus.OK)
  async index(@Query() query: ProductQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getProducts(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('products/:slug')
  @HttpCode(HttpStatus.OK)
  async detailProduct(@Param('slug') slug: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getProductBySlug(slug),
      };
    } catch (error) {
      throw error;
    }
  }
}
