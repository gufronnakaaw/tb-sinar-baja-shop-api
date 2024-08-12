import {
  Body,
  Controller,
  Delete,
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
import { SuccessResponse } from '../utils/global/global.response';
import { UserGuard } from '../utils/guards/user.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreateCartDto,
  createCartSchema,
  UpdateActiveCart,
  updateActiveCart,
} from './carts.dto';
import { CartsService } from './carts.service';

@Controller('carts')
@UseGuards(UserGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(@Req() request: Request): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.cartsService.getCarts(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createCartSchema))
  async store(
    @Body() body: CreateCartDto,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.cartsService.createCart(body, request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateActiveCart))
  async updateActiveCart(
    @Body() body: UpdateActiveCart,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.cartsService.updateActiveCart({
          cart_id: body.cart_id,
          user_id: request.user.user_id,
          value: body.value,
        }),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':cart_id')
  @HttpCode(HttpStatus.OK)
  async destroy(
    @Param('cart_id') cart_id: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.cartsService.deleteCart(cart_id, request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }
}
