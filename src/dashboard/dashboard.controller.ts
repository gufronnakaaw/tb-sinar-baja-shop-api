import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { ZodValidationPipe } from 'src/utils/pipes/zod.pipe';
import { ProductQuery } from '../products/product.dto';
import { SuccessResponse } from '../utils/global/global.response';
import { AdminGuard } from '../utils/guards/admin.guard';
import {
  CreateBankDto,
  createBankSchema,
  CreatePollingDto,
  createPollingSchema,
  TransactionQuery,
  updateActive,
  UpdateActive,
  UpdateBankDto,
  updateBankSchema,
  UpdateCancelDto,
  updateCancelSchema,
  UpdateCostDto,
  updateCostSchema,
  UpdateDoneDto,
  updateDoneSchema,
  UpdateDraftDto,
  updateDraftSchema,
  UpdatePollingDto,
  updatePollingSchema,
  UpdateVerificationDto,
  updateVerificationSchema,
} from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async indexDashboard(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getDashboard(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/products')
  @HttpCode(HttpStatus.OK)
  async indexProducts(@Query() query: ProductQuery): Promise<SuccessResponse> {
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

  @Get('/products/search')
  @HttpCode(HttpStatus.OK)
  async searchProducts(@Query() query: ProductQuery): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.searchProducts(query),
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
        data: await this.dashboardService.getPolling(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/polling')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createPollingSchema))
  async createPolling(
    @Body() body: CreatePollingDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.createPolling(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/polling')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updatePollingSchema))
  async updatePolling(
    @Body() body: UpdatePollingDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updatePolling(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/polling/:id')
  @HttpCode(HttpStatus.OK)
  async destroyPolling(@Param('id') id: string): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.destroyPolling(id),
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

  @Patch('/categories/active')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateActive))
  async updateActiveCategory(
    @Body() body: UpdateActive,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateActive({
          type: 'category',
          nama_kategori: body.nama_kategori,
          value: body.value,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/products/active')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateActive))
  async updateActiveProduct(
    @Body() body: UpdateActive,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateActive({
          type: 'product',
          kode_item: body.kode_item,
          value: body.value,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/banks')
  @HttpCode(HttpStatus.OK)
  async getBanks(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getBanks(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/banks')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createBankSchema))
  async createBank(@Body() body: CreateBankDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.dashboardService.createBank(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/banks')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateBankSchema))
  async updateBank(@Body() body: UpdateBankDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateBank(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/banks/:bank_id')
  @HttpCode(HttpStatus.OK)
  async destroyBank(
    @Param('bank_id') bank_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.destroyBank(bank_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/operators')
  @HttpCode(HttpStatus.OK)
  async getOperators(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getOperators(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/operators/:username')
  @HttpCode(HttpStatus.OK)
  async destroyOperator(
    @Param('username') username: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.deleteOperator(username),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/operational')
  @HttpCode(HttpStatus.OK)
  async getOperationals(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getOperationals(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCostSchema))
  async getTransaction(
    @Query() query: TransactionQuery,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getTransactions(query),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions/cost')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCostSchema))
  async updateCost(@Body() body: UpdateCostDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateCost(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions/draft')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateDraftSchema))
  async updateDraft(@Body() body: UpdateDraftDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateDraft(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions/verification')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateVerificationSchema))
  async updateVerification(
    @Body() body: UpdateVerificationDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateVerification(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions/done')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateDoneSchema))
  async updateDone(@Body() body: UpdateDoneDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateDone(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/transactions/cancel')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCancelSchema))
  async updateCancel(@Body() body: UpdateCancelDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.updateCancel(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/transactions/tabs')
  @HttpCode(HttpStatus.OK)
  async getTransactionTabs(): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getTransactionTabs(),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/transactions/detail/:transaksi_id')
  @HttpCode(HttpStatus.OK)
  async getTransactionDetail(
    @Param('transaksi_id') transaksi_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.dashboardService.getTransactionDetail(transaksi_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
