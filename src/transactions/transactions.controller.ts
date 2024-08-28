import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import {
  UpdateCancelDto,
  updateCancelSchema,
} from '../dashboard/dashboard.dto';
import { SuccessResponse } from '../utils/global/global.response';
import { UserGuard } from '../utils/guards/user.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreateTransactionDto,
  createTransactionSchema,
  UpdateDraftDto,
  updateDraftSchema,
} from './transactions.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@UseGuards(UserGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() request: Request): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.transactionsService.findAll(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/detail/:transaksi_id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('transaksi_id') transaksi_id: string,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.transactionsService.findOne(transaksi_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  async create(
    @Body() body: CreateTransactionDto,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.transactionsService.create(body, request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/draft')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateDraftSchema))
  async updateDraft(@Body() body: UpdateDraftDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.transactionsService.updateDraft(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/cancel')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateCancelSchema))
  async updateCancel(@Body() body: UpdateCancelDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.transactionsService.updateCancel(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
