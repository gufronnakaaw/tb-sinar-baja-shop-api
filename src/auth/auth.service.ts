import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../utils/bcrypt.util';
import { PrismaService } from '../utils/services/prisma.service';
import { LoginOperatorDto } from './auth.dto';

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
}
