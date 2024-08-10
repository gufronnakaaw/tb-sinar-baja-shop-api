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
import {
  LoginOperatorDto,
  loginOperatorSchema,
  LoginUserDto,
  loginUserSchema,
  RegisterUserDto,
  registerUserSchema,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login/operators')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginOperatorSchema))
  async loginOperator(
    @Body() body: LoginOperatorDto,
  ): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.authService.loginOperator(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/register/users')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(registerUserSchema))
  async registerUser(@Body() body: RegisterUserDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.CREATED,
        data: await this.authService.registerUser(body),
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('/login/users')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  async loginUser(@Body() body: LoginUserDto): Promise<SuccessResponse> {
    try {
      return {
        success: true,
        status_code: HttpStatus.OK,
        data: await this.authService.loginUser(body),
      };
    } catch (error) {
      throw error;
    }
  }
}
