import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { SuccessResponse } from '../utils/global/global.response';
import { ZodValidationPipe } from '../utils/pipes/zod.pipe';
import { LoginOperatorDto, loginOperatorSchema } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login/operators')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(loginOperatorSchema))
  async loginOperator(
    @Body() body: LoginOperatorDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.authService.loginOperator(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
