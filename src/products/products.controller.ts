import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { SuccessResponse } from 'src/utils/global/global.response';
import { ProductQuery } from './product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(@Query() query: ProductQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.productsService.getProducts(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async getProductBySlug(
    @Param('slug') slug: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.productsService.getProductBySlug(slug),
      };
    } catch (error) {
      throw error;
    }
  }
}
