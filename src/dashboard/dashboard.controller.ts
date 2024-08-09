import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { ProductQuery } from '../products/product.dto';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/products')
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

  @Get('/products/:slug')
  @HttpCode(HttpStatus.OK)
  async getProductBySlug(
    @Param('slug') slug: string,
  ): Promise<SuccessResponse> {
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

  @Get('/products/detail/:kode_item')
  @HttpCode(HttpStatus.OK)
  async getProductByKodeItem(
    @Param('kode_item') kode_item: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getProductByKodeItem(kode_item),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/products/image')
  @UseInterceptors(
    FileInterceptor('product', {
      storage: diskStorage({
        destination: './public/products',
        filename(req, file, callback) {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
    }),
  )
  async storeImage(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: { kode_item: string; deskripsi: string },
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.createImage(
          file,
          req.fullurl,
          body.kode_item,
          body.deskripsi,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/products/image/:id')
  @HttpCode(HttpStatus.OK)
  async destroyProductImage(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.deleteImage(
          parseInt(id),
          req.fullurl,
        ),
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
        data: await this.dashboardService.getCategories(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/sync/products')
  @HttpCode(HttpStatus.CREATED)
  async syncProducts(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.syncProducts(),
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
        data: await this.dashboardService.syncCategories(),
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
        data: await this.dashboardService.syncProductByCategories(id_kategori),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/sync/operators')
  @HttpCode(HttpStatus.CREATED)
  async syncOperators(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.syncOperators(),
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
        data: await this.dashboardService.polling(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/banners')
  @HttpCode(HttpStatus.OK)
  async getBanners(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getBanners(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/banners')
  @UseInterceptors(
    FileInterceptor('banner', {
      storage: diskStorage({
        destination: './public/banners',
        filename(req, file, callback) {
          callback(null, `${Date.now()}-${file.originalname}`);
        },
      }),
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1 * 1024 * 1024,
      },
    }),
  )
  async store(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.createBanner(file, req.fullurl),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/banners/:id')
  @HttpCode(HttpStatus.OK)
  async destroy(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.deleteBanner(
          parseInt(id),
          req.fullurl,
        ),
      };
    } catch (error) {
      throw error;
    }
  }
}
