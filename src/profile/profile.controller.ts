import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SuccessResponse } from 'src/utils/global/global.response';
import { UserGuard } from '../utils/guards/user.guard';
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
}
