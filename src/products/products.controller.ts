import {
  BadRequestException,
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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
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

  @Post('/image')
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
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.productsService.createImage(file, req.fullurl),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/image/:id')
  @HttpCode(HttpStatus.OK)
  async destroy(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.productsService.deleteImage(parseInt(id), req.fullurl),
      };
    } catch (error) {
      throw error;
    }
  }
}
