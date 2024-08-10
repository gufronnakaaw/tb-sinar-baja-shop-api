import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { removeKeys } from 'src/utils/removekey.util';
import { hashPassword, verifyPassword } from '../utils/bcrypt.util';
import { PrismaService } from '../utils/services/prisma.service';
import { LoginOperatorDto, LoginUserDto, RegisterUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async loginOperator({ username, password }: LoginOperatorDto) {
    const operator = await this.prisma.operator.findUnique({
      where: {
        username,
      },
    });

    if (!operator) {
      throw new BadRequestException('Username or password wrong');
    }

    if (!(await verifyPassword(password, operator.password_hash))) {
      throw new BadRequestException('Username or password wrong');
    }

    return {
      nama: operator.nama,
      access_token: await this.jwtService.signAsync(
        {
          username: operator.username,
          role: 'admin',
        },
        {
          expiresIn: '6h',
        },
      ),
    };
  }

  async registerUser(body: RegisterUserDto) {
    if (
      await this.prisma.user.findUnique({
        where: {
          email: body.email,
        },
      })
    ) {
      throw new BadRequestException('Email already registered');
    }

    return removeKeys(
      await this.prisma.user.create({
        data: {
          email: body.email,
          no_telpon: body.email,
          nama: body.nama,
          password_hash: await hashPassword(body.password),
        },
      }),
      ['id'],
    );
  }

  async loginUser(body: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        user_id: true,
        password_hash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Email or password wrong');
    }

    if (!(await verifyPassword(body.password, user.password_hash))) {
      throw new NotFoundException('Email or password wrong');
    }

    return {
      access_token: await this.jwtService.signAsync({
        user_id: user.user_id,
        role: 'user',
      }),
    };
  }
}
