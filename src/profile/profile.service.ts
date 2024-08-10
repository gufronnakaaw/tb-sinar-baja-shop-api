import { Injectable } from '@nestjs/common';
import { removeKeys } from '../utils/removekey.util';
import { PrismaService } from '../utils/services/prisma.service';
import { UpdateProfileDto } from './profile.dto';

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

  getProfileDetail(user_id: string) {
    return this.prisma.user.findUnique({
      where: {
        user_id,
      },
      select: {
        nama: true,
        tanggal_lahir: true,
        jenis_kelamin: true,
        email: true,
        no_telpon: true,
      },
    });
  }

  async updateProfile(body: UpdateProfileDto, user_id: string) {
    return removeKeys(
      await this.prisma.user.update({
        where: {
          user_id,
        },
        data: {
          nama: body.nama,
          jenis_kelamin: body.jenis_kelamin,
          no_telpon: body.no_telpon,
          tanggal_lahir: body.tanggal_lahir,
        },
      }),
      ['id'],
    );
  }
}
