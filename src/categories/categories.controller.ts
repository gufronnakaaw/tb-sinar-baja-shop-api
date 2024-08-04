import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SuccessResponse } from 'src/utils/global/global.response';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.categoriesService.getCategories(),
      };
    } catch (error) {
      throw error;
    }
  }
}
