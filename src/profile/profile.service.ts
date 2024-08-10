import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(user_id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id,
      },
      select: {
        nama: true,
        email: true,
      },
    });

    return {
      ...user,
      total_transaction: 0,
    };
  }
}
