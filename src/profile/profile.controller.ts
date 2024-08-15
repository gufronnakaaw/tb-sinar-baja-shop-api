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
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { SuccessResponse } from 'src/utils/global/global.response';
import { UserGuard } from '../utils/guards/user.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import {
  CreateAddressDto,
  createAddressSchema,
  ProfileQuery,
  UpdateAddressDto,
  updateAddressSchema,
  UpdateProfileDto,
  updateProfileSchema,
} from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(UserGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async index(@Req() request: Request): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.getProfile(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/detail')
  @HttpCode(HttpStatus.OK)
  async getProfileDetail(@Req() request: Request): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.getProfileDetail(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateProfile(
    @Body() body: UpdateProfileDto,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.updateProfile(
          body,
          request.user.user_id,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('/address')
  @HttpCode(HttpStatus.OK)
  async getAddress(
    @Req() request: Request,
    @Query() query: ProfileQuery,
  ): Promise<SuccessResponse> {
    try {
      if (query.address_id) {
        return {
          success: true,
          status_code: HttpStatus.OK,
          data: await this.profileService.getAddressById(
            query.address_id,
            request.user.user_id,
          ),
        };
      }
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.getAddress(request.user.user_id),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/address')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createAddressSchema))
  async createAddress(
    @Body() body: CreateAddressDto,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.profileService.createAddress(
          body,
          request.user.user_id,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch('/address')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(updateAddressSchema))
  async updateAddress(
    @Body() body: UpdateAddressDto,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.updateAddress(
          body,
          request.user.user_id,
        ),
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('/address/:address_id')
  @HttpCode(HttpStatus.OK)
  async deleteAddress(
    @Param('address_id') address_id: string,
    @Req() request: Request,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.profileService.deleteAddress(
          address_id,
          request.user.user_id,
        ),
      };
    } catch (error) {
      throw error;
    }
  }
}
