import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { SuccessResponse } from 'src/utils/global/global.response';
import { UserGuard } from '../utils/guards/user.guard';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import { UpdateProfileDto, updateProfileSchema } from './profile.dto';
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
}
